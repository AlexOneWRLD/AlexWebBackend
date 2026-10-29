import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { verify } from 'argon2';
import type { Request } from 'express';
import type { Response } from 'express';
import { AUTH_MESSAGES } from '@/auth/constants/auth.messages';
import { LoginDto } from '@/auth/dto/login.dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { TokenService } from '@/auth/services/token.service';
import { hashRefreshToken, matchesRefreshToken } from '@/common/utils/refresh-token.util';
import { destroySession, regenerateSession, saveSession } from '@/common/utils/session.util';
import { createCookieConfig, REFRESH_COOKIE } from '@/config/cookie.config';
import { jwtConfig } from '@/config/jwt.config';
import { sessionConfig } from '@/config/session.config';
import { UserService } from '@/user/user.service';

@Injectable()
export class AuthService {
	private readonly cookieConfig: ReturnType<typeof createCookieConfig>;

	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,

		@Inject(sessionConfig.KEY)
		sessionSettings: ConfigType<typeof sessionConfig>,

		@Inject(jwtConfig.KEY)
		jwtSettings: ConfigType<typeof jwtConfig>
	) {
		this.cookieConfig = createCookieConfig(sessionSettings, jwtSettings);
	}

	public async register(req: Request, res: Response, dto: RegisterDto) {
		const newUser = await this.userService.createUser(dto);

		return this.startSession(req, res, newUser.id);
	}

	public async login(req: Request, res: Response, dto: LoginDto) {
		const user = await this.userService.findByLogin(dto.login);

		if (!user || user.deletedAt !== null) {
			throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
		}

		const isValidPassword = await verify(user.password, dto.password);

		if (!isValidPassword) {
			throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
		}

		return this.startSession(req, res, user.id);
	}

	public async logout(req: Request, res: Response) {
		await destroySession(req);

		res.clearCookie(REFRESH_COOKIE, this.cookieConfig.cookieOptions);

		res.clearCookie(this.cookieConfig.sessionName, this.cookieConfig.cookieOptions);

		return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
	}

	public async validate(id: string) {
		try {
			return await this.userService.findById(id);
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
			}

			throw error;
		}
	}

	public async refresh(req: Request, res: Response) {
		const sessionUserId = req.session?.userId;

		if (!sessionUserId) {
			throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
		}

		const refreshToken: unknown = req.cookies?.[REFRESH_COOKIE];

		if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
			throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
		}

		const userId = await this.tokenService.verifyRefresh(refreshToken);

		if (userId !== sessionUserId) {
			throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
		}

		const storedHash = req.session.refreshTokenHash;

		if (!storedHash || !matchesRefreshToken(refreshToken, storedHash)) {
			throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
		}

		const user = await this.validate(userId);

		return this.issueAndSaveTokens(req, res, user.id);
	}

	private async startSession(req: Request, res: Response, userId: string) {
		await regenerateSession(req);

		req.session.userId = userId;

		await saveSession(req);

		return this.issueAndSaveTokens(req, res, userId);
	}

	private async issueAndSaveTokens(
		req: Request,
		res: Response,
		userId: string
	): Promise<{ accessToken: string }> {
		const { accessToken, refreshToken } = this.tokenService.issuePair(userId);

		req.session.refreshTokenHash = hashRefreshToken(refreshToken);

		await saveSession(req);

		res.cookie(REFRESH_COOKIE, refreshToken, this.cookieConfig.refreshCookieOptions);

		return {
			accessToken
		};
	}
}
