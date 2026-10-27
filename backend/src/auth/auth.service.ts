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
import { isDev } from '@/common/utils/is-dev.util';
import { ms } from '@/common/utils/ms.util';
import { UserService } from '@/user/user.service';

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
		const isExistLogin = await this.userService.findByLogin(dto.login);

		if (isExistLogin) {
			throw new ConflictException(
				'Регистрация не удалась. Пользователь с таким логином уже существует. Пожалуйста, используйте другой логин или войдите в систему.'
			);
		}

		const isExistEmail = await this.userService.findByEmail(dto.email);

		if (isExistEmail) {
			throw new ConflictException(
				'Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему.'
			);
		}

		const newUser = await this.userService.createUser(dto);

		await this.regenerateSession(req);

		req.session.userId = newUser.id;

		await this.saveSession(req);

		return this.auth(res, newUser.id);
	}

	public async login(req: Request, res: Response, dto: LoginDto) {
		const user = await this.userService.findByLogin(dto.login);

		if (!user || user.deletedAt !== null || !user.password) {
			throw new UnauthorizedException('Неверный логин или пароль');
		}

		const isValidPassword = await verify(user.password, dto.password);

		if (!isValidPassword) {
			throw new UnauthorizedException('Неверный логин или пароль');
		}

		await this.regenerateSession(req);

		req.session.userId = user.id;

		await this.saveSession(req);

		return this.auth(res, user.id);
	}

	public async logout(req: Request, res: Response) {
		await new Promise<void>((resolve, reject) => {
			req.session.destroy(err => (err ? reject(err) : resolve()));
		});

		this.setCookie(res, '', new Date(0));

		res.clearCookie('session', {
			domain: this.configService.get<string>('SESSION_DOMAIN'),
			path: '/'
		});

		return { message: 'Выход выполнен' };
	}

	public async validate(id: string) {
		try {
			return await this.userService.findById(id);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new UnauthorizedException('Пользователь не найден или удалён');
			}

			throw error;
		}
	}

	public async refresh(req: Request, res: Response) {
		const sessionUserId = req.session?.userId;

		if (!sessionUserId) {
			throw new UnauthorizedException('Пользователь не вошёл в систему');
		}

		const refreshToken: unknown = req.cookies['refreshToken'];

		if (typeof refreshToken !== 'string' || !refreshToken) {
			throw new UnauthorizedException('Недействительный refresh-token');
		}

		let payload: JwtPayload;

		try {
			payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
		} catch {
			throw new UnauthorizedException('Refresh-токен повреждён или просрочен');
		}

		if (payload.type !== 'refresh_token') {
			throw new UnauthorizedException('Неверный тип токена');
		}

		if (payload.id !== sessionUserId) {
			throw new UnauthorizedException('Сессия не соответствует токену');
		}

		const user = await this.validate(payload.id);

		return this.auth(res, user.id);
	}

	private auth(res: Response, id: string) {
		const { accessToken, refreshToken } = this.generateToken(id);

		this.setCookie(res, refreshToken, new Date(Date.now() + ms(this.JWT_REFRESH_TOKEN_TTL)));

		return { accessToken };
	}

	private generateToken(id: string) {
		const accessPayload: JwtPayload = {
			id,
			type: 'access_token'
		};

		const refreshPayload: JwtPayload = {
			id,
			type: 'refresh_token'
		};

		const accessToken = this.jwtService.sign(accessPayload, {
			expiresIn: ms(this.JWT_ACCESS_TOKEN_TTL) / 1000
		});

		const refreshToken = this.jwtService.sign(refreshPayload, {
			expiresIn: ms(this.JWT_REFRESH_TOKEN_TTL) / 1000
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

	private regenerateSession(req: Request): Promise<void> {
		return new Promise((resolve, reject) => {
			req.session.regenerate(err => {
				if (err) {
					return reject(err);
				}

				resolve();
			});
		});
	}
}
