import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TokenService } from '@/auth/services/token.service';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { jwtConfig } from '@/config/jwt.config';
import { UserModule } from '@/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [
		UserModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],

			inject: [jwtConfig.KEY],

			useFactory: (config: ConfigType<typeof jwtConfig>): JwtModuleOptions => ({
				secret: config.secret,

				signOptions: {
					algorithm: config.algorithm
				},

				verifyOptions: {
					algorithms: [config.algorithm],
					ignoreExpiration: false
				}
			})
		})
	],

	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, TokenService]
})
export class AuthModule {}
