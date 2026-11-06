import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '@/auth/auth.service';
import { JwtPayload } from '@/auth/interfaces/jwt.interface';
import { jwtConfig } from '@/config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService,

		@Inject(jwtConfig.KEY)
		jwt: ConfigType<typeof jwtConfig>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwt.secret,
			algorithms: [jwt.algorithm]
		});
	}

	async validate(payload: JwtPayload) {
		if (payload.type !== 'access_token') {
			throw new UnauthorizedException('Необходим access-токен');
		}

		return this.authService.validate(payload.id);
	}
}
