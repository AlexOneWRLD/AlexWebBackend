import { ConfigType } from '@nestjs/config';
import type { CookieOptions } from 'express';
import ms from 'ms';
import { jwtConfig } from '@/config/jwt.config';
import { sessionConfig } from '@/config/session.config';

export const REFRESH_COOKIE = 'refreshToken' as const;

export function createCookieConfig(
	session: ConfigType<typeof sessionConfig>,
	jwt: ConfigType<typeof jwtConfig>
) {
	const cookieOptions: CookieOptions = {
		httpOnly: session.httpOnly,
		secure: session.secure,
		sameSite: 'lax',
		path: '/',

		...(session.domain ? { domain: session.domain } : {})
	};

	return {
		sessionName: session.name,

		cookieOptions,

		sessionCookieOptions: {
			...cookieOptions,
			maxAge: ms(session.maxAge)
		},

		refreshCookieOptions: {
			...cookieOptions,
			maxAge: ms(jwt.refreshTtl)
		}
	};
}
