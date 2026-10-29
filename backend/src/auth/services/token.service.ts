import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { AUTH_MESSAGES } from '@/auth/constants/auth.messages';
import type { JwtPayload } from '@/auth/interfaces/jwt.interface';
import { jwtConfig } from '@/config/jwt.config';

@Injectable()
export class TokenService {
	private readonly logger = new Logger(TokenService.name);

	constructor(
		private readonly jwtService: JwtService,

		@Inject(jwtConfig.KEY)
		private readonly jwtSettings: ConfigType<typeof jwtConfig>
	) {}

	public issuePair(userId: string): {
		accessToken: string;
		refreshToken: string;
	} {
		const accessPayload: JwtPayload = {
			id: userId,
			type: 'access_token'
		};

		const refreshPayload: JwtPayload = {
			id: userId,
			type: 'refresh_token'
		};

		const accessToken = this.jwtService.sign(accessPayload, {
			expiresIn: this.jwtSettings.accessTtl
		});

		const refreshToken = this.jwtService.sign(refreshPayload, {
			expiresIn: this.jwtSettings.refreshTtl,
			jwtid: randomUUID()
		});

		return {
			accessToken,
			refreshToken
		};
	}

	public async verifyRefresh(token: string): Promise<string> {
		let payload: unknown;

		try {
			payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token, {
				algorithms: ['HS256']
			});
		} catch (error: unknown) {
			this.logger.debug(
				`Refresh verification failed: ${
					error instanceof Error ? error.name : 'UnknownError'
				}`
			);

			throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
		}

		if (
			typeof payload !== 'object' ||
			payload === null ||
			!('id' in payload) ||
			typeof payload.id !== 'string' ||
			payload.id.length === 0 ||
			!('type' in payload) ||
			payload.type !== 'refresh_token'
		) {
			this.logger.debug('Invalid refresh payload');

			throw new UnauthorizedException(AUTH_MESSAGES.SESSION_EXPIRED);
		}

		return payload.id;
	}
}
