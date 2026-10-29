import { registerAs } from '@nestjs/config';
import { envSchema } from './env.validation';

export const redisConfig = registerAs('redis', () => {
	const env = envSchema.parse(process.env);

	return {
		url: env.REDIS_URL
	};
});
