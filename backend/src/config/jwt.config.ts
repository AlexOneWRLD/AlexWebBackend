import { registerAs } from '@nestjs/config';
import { envSchema } from './env.validation';

export const jwtConfig = registerAs('jwt', () => {
	const env = envSchema.parse(process.env);

	return {
		secret: env.JWT_SECRET,
		accessTtl: env.JWT_ACCESS_TOKEN_TTL,
		refreshTtl: env.JWT_REFRESH_TOKEN_TTL,
		algorithm: 'HS256' as const
	};
});
