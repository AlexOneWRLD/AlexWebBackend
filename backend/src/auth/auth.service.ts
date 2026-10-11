import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import type { Request } from 'express';
import type { Response } from 'express';
import { LoginDto } from '@/auth/dto/login.dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import type { JwtPayload } from '@/auth/interfaces/jwt.interface';
import { UserService } from '@/user/user.service';
import { isDev } from '../../libs/common/utils/is-dev.util';
import { ms } from '../../libs/common/utils/ms.util';

@Injectable()
export class AuthService {
	private readonly JWT_ACCESS_TOKEN_TTL: string;
	private readonly JWT_REFRESH_TOKEN_TTL: string;

	private readonly COOKIE_DOMAIN: string;

	public constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {
		this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>('JWT_ACCESS_TOKEN_TTL');
		this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>('JWT_REFRESH_TOKEN_TTL');

		this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
	}

	public async register(req: Request, res: Response, dto: RegisterDto) {
		const isExist = await this.userService.findByEmail(dto.email);

		if (isExist) {
			throw new ConflictException(
				'Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему.'
			);
		}

		const newUser = await this.userService.create(
			dto.email,
			dto.password,
			dto.name,
			dto.age,
			dto.description,
			'',
			0
		);

		req.session.userId = newUser.id;

		await this.saveSession(req);

		return this.auth(res, newUser.id);
	}

	public async login(req: Request, res: Response, dto: LoginDto) {
		const user = await this.userService.findByEmail(dto.email);

		if (!user || !user.password) {
			throw new NotFoundException(
				'Пользователь не найден. Пожалуйста, проверьте введенные данные'
			);
		}

		const isValidPassword = await verify(user.password, dto.password);

		if (!isValidPassword) {
			throw new UnauthorizedException('Неверный пароль. Пожалуйста, попробуйте еще раз.	');
		}

		req.session.userId = user.id;

		await this.saveSession(req);

		return this.auth(res, user.id);
	}

	public async logout(res: Response) {
		this.setCookie(res, 'refreshToken', new Date(0));
	}

	public async validate(id: string) {
		const user = await this.userService.findById(id);

		if (!user) {
			throw new NotFoundException('Пользователь не найден');
		}

		return user;
	}

	public async refresh(req: Request, res: Response) {
		const sessionUserId = req.session?.userId;

		if (!sessionUserId) {
			throw new UnauthorizedException('Пользователь не вошел в систему');
		}

		const refreshToken: unknown = req.cookies['refreshToken'];

		if (typeof refreshToken !== 'string') {
			throw new UnauthorizedException('Недействительный refresh-token');
		}

		if (!refreshToken) {
			throw new UnauthorizedException('Недействительный refresh-token');
		}

		const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

		if (payload) {
			const user = await this.userService.findById(payload.id);

			if (!user) {
				throw new NotFoundException('Пользователь не найден');
			}

			return this.auth(res, user.id);
		}
	}

	private auth(res: Response, id: string) {
		const { accessToken, refreshToken } = this.generateToken(id);

		this.setCookie(res, refreshToken, new Date(Date.now() + ms(this.JWT_REFRESH_TOKEN_TTL)));

		return { accessToken };
	}

	private generateToken(id: string) {
		const payload: JwtPayload = { id };

		const accessToken = this.jwtService.sign(payload, {
			expiresIn: ms(this.JWT_ACCESS_TOKEN_TTL)
		});

		const refreshToken = this.jwtService.sign(payload, {
			expiresIn: ms(this.JWT_REFRESH_TOKEN_TTL)
		});

		return {
			accessToken,
			refreshToken
		};
	}

	private setCookie(res: Response, value: string, expires: Date) {
		res.cookie('refreshToken', value, {
			httpOnly: true,
			domain: this.COOKIE_DOMAIN,
			expires,
			secure: !isDev(this.configService),
			sameSite: isDev(this.configService) ? 'none' : 'lax'
		});
	}

	private saveSession(req: Request): Promise<void> {
		return new Promise((resolve, reject) => {
			req.session.save(error => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}
}
