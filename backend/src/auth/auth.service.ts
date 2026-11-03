import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { verify } from 'argon2';
import { AUTH_MESSAGES } from '@/auth/constants/auth.messages';
import { LoginDto } from '@/auth/dto/login.dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { TokenService } from '@/auth/services/token.service';
import { matchesRefreshToken } from '@/common/utils/refresh-token.util';
import { UserService } from '@/user/user.service';

export interface AuthResult {
	userId: string;
	accessToken: string;
	refreshToken: string;
}

export interface RefreshInput {
	sessionUserId: string | undefined;
	refreshToken: string | undefined;
	storedHash: string | undefined;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService
	) {}

	public async register(dto: RegisterDto): Promise<AuthResult> {
		const newUser = await this.userService.createUser(dto);

		return this.issueTokens(newUser.id);
	}

	public async login(dto: LoginDto): Promise<AuthResult> {
		const user = await this.userService.findByLogin(dto.login);

		if (!user || user.deletedAt !== null) {
			throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
		}

		const isValidPassword = await verify(user.password, dto.password);

		if (!isValidPassword) {
			throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
		}

		return this.issueTokens(user.id);
	}

	public async refresh(input: RefreshInput): Promise<AuthResult> {
		const { sessionUserId, refreshToken, storedHash } = input;

		if (!sessionUserId || !refreshToken || !storedHash) {
			throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
		}

		const userId = await this.tokenService.verifyRefresh(refreshToken);

		if (userId !== sessionUserId) {
			throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
		}

		if (!matchesRefreshToken(refreshToken, storedHash)) {
			throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
		}

		const user = await this.validate(userId);

		return this.issueTokens(user.id);
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

	private issueTokens(userId: string) {
		const { accessToken, refreshToken } = this.tokenService.issuePair(userId);

		return {
			userId,
			accessToken,
			refreshToken
		};
	}
}
