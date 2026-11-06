import { registerAs } from '@nestjs/config';
import { envSchema } from './env.validation';

export const appConfig = registerAs('app', () => {
	const env = envSchema.parse(process.env);

	return {
		nodeEnv: env.NODE_ENV,
		isDev: env.NODE_ENV === 'development',

		port: env.APPLICATION_PORT,
		url: env.APPLICATION_URL,
		allowedOrigin: env.ALLOWED_ORIGIN,
		cookiesSecret: env.COOKIES_SECRET
	};
});
