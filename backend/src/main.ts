import { type ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RedisStore } from 'connect-redis';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import Redis from 'ioredis';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { setupSwagger } from '@/common/utils/swagger.util';
import { appConfig } from '@/config/app.config';
import { createCookieConfig } from '@/config/cookie.config';
import { jwtConfig } from '@/config/jwt.config';
import { redisConfig } from '@/config/redis.config';
import { sessionConfig } from '@/config/session.config';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const appSettings = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

	const jwtSettings = app.get<ConfigType<typeof jwtConfig>>(jwtConfig.KEY);

	const sessionSettings = app.get<ConfigType<typeof sessionConfig>>(sessionConfig.KEY);

	const redisSettings = app.get<ConfigType<typeof redisConfig>>(redisConfig.KEY);

	const cookieConfig = createCookieConfig(sessionSettings, jwtSettings);

	const redis = new Redis(redisSettings.url);

	app.use(cookieParser(appSettings.cookiesSecret));

	app.useGlobalFilters(new AllExceptionsFilter());

	app.use(
		session({
			secret: sessionSettings.secret,
			name: sessionSettings.name,

			resave: false,
			saveUninitialized: false,

			cookie: cookieConfig.sessionCookieOptions,

			store: new RedisStore({
				client: redis,
				prefix: sessionSettings.folder
			})
		})
	);

	app.enableCors({
		origin: appSettings.allowedOrigin,
		credentials: true
	});

	setupSwagger(app);

	await app.listen(appSettings.port);
}

bootstrap().catch((error: unknown) => {
	console.error('Ошибка запуска приложения:', error);
	process.exitCode = 1;
});
