import { registerAs } from '@nestjs/config';
import { envSchema } from './env.validation';

export const databaseConfig = registerAs('database', () => {
	const env = envSchema.parse(process.env);

	return {
		url: env.POSTGRES_URL
	};
});
