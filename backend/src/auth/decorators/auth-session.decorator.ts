import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { destroySession, regenerateSession, saveSession } from '@/common/utils/session.util';
import { REFRESH_COOKIE } from '@/config/cookie.config';

export interface AuthSessionContext {
	readonly userId: string | undefined;
	readonly refreshTokenHash: string | undefined;
	readonly refreshToken: string | undefined;

	regenerate(): Promise<void>;
	authenticate(userId: string, hash: string): void;
	setRefreshTokenHash(hash: string): void;
	save(): Promise<void>;
	destroy(): Promise<void>;
}

export const AuthSession = createParamDecorator<undefined>(
	(_data: undefined, ctx: ExecutionContext): AuthSessionContext => {
		const req = ctx.switchToHttp().getRequest<Request>();

		return {
			get userId() {
				return req.session.userId;
			},

			get refreshTokenHash() {
				return req.session.refreshTokenHash;
			},

			get refreshToken() {
				const token: unknown = req.cookies?.[REFRESH_COOKIE];

				return typeof token === 'string' ? token : undefined;
			},

			regenerate: () => regenerateSession(req),

			authenticate: (userId: string, hash: string) => {
				req.session.userId = userId;
				req.session.refreshTokenHash = hash;
			},

			setRefreshTokenHash: (hash: string) => {
				req.session.refreshTokenHash = hash;
			},

			save: () => saveSession(req),

			destroy: () => destroySession(req)
		};
	}
);
