import { registerAs } from '@nestjs/config';
import { envSchema } from './env.validation';

export const sessionConfig = registerAs('session', () => {
	const env = envSchema.parse(process.env);

	return {
		secret: env.SESSION_SECRET,
		name: env.SESSION_NAME,
		maxAge: env.SESSION_MAX_AGE,
		folder: env.SESSION_FOLDER,

		httpOnly: env.SESSION_HTTP_ONLY,
		secure: env.SESSION_SECURE,

		domain: env.COOKIE_DOMAIN
	};
});
