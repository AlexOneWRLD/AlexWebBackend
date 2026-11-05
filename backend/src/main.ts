import { ValidationPipe } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RedisStore } from 'connect-redis';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { setupSwagger } from '@/common/utils/swagger.util';
import { appConfig } from '@/config/app.config';
import { createCookieConfig } from '@/config/cookie.config';
import { jwtConfig } from '@/config/jwt.config';
import { sessionConfig } from '@/config/session.config';
import { RedisService } from '@/redis/redis.service';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableShutdownHooks(['SIGINT', 'SIGTERM']);

	try {
		const appSettings = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

		const jwtSettings = app.get<ConfigType<typeof jwtConfig>>(jwtConfig.KEY);

		const sessionSettings = app.get<ConfigType<typeof sessionConfig>>(sessionConfig.KEY);

		const redisService = app.get(RedisService);

		const cookieConfig = createCookieConfig(sessionSettings, jwtSettings);

		await redisService.client.ping();

		app.use(cookieParser(appSettings.cookiesSecret));

		app.useGlobalPipes(
			new ValidationPipe({
				transform: true,
				whitelist: true,
				forbidNonWhitelisted: true
			})
		);

		app.useGlobalFilters(new AllExceptionsFilter());

		app.use(
			session({
				secret: sessionSettings.secret,
				name: sessionSettings.name,

				resave: false,
				saveUninitialized: false,

				cookie: cookieConfig.sessionCookieOptions,

				store: new RedisStore({
					client: redisService.client,
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
	} catch (error: unknown) {
		try {
			await app.close();
		} catch (closeError: unknown) {
			console.error('Ошибка закрытия приложения:', closeError);
		}

		throw error;
	}
}

bootstrap().catch((error: unknown) => {
	console.error('Ошибка запуска приложения:', error);
	process.exitCode = 1;
});
