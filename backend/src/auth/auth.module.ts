import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { getJwtConfig } from '@/config/jwt.config';
import { UserModule } from '@/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [
		UserModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getJwtConfig,
			inject: [ConfigService]
		})
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
