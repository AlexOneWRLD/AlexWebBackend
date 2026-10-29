import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '@/config/app.config';
import { databaseConfig } from '@/config/database.config';
import { validateEnv } from '@/config/env.validation';
import { jwtConfig } from '@/config/jwt.config';
import { redisConfig } from '@/config/redis.config';
import { sessionConfig } from '@/config/session.config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,

			envFilePath: '.env',

			cache: true,

			validate: validateEnv,

			load: [appConfig, jwtConfig, sessionConfig, databaseConfig, redisConfig]
		}),

		PrismaModule,
		AuthModule,
		UserModule
	]
})
export class AppModule {}
