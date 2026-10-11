import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { getJwtConfig } from '@/config/jwt.config';
import { UserService } from '@/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getJwtConfig,
			inject: [ConfigService]
		})
	],
	controllers: [AuthController],
	providers: [AuthService, UserService, JwtStrategy]
})
export class AuthModule {}
