import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Res } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AUTH_MESSAGES } from '@/auth/constants/auth.messages';
import { AuthSession, AuthSessionContext } from '@/auth/decorators/auth-session.decorator';
import { ApiErrorBadRequestDto } from '@/common/dto/api-error-bad-request.dto';
import { ApiErrorConflictDto } from '@/common/dto/api-error-conflict.dto';
import { ApiErrorUnauthorizedResponseDto } from '@/common/dto/api-error-unauthorized.dto';
import { hashRefreshToken } from '@/common/utils/refresh-token.util';
import { createCookieConfig, REFRESH_COOKIE } from '@/config/cookie.config';
import { jwtConfig } from '@/config/jwt.config';
import { sessionConfig } from '@/config/session.config';
import { AuthResult, AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	private readonly cookieConfig: ReturnType<typeof createCookieConfig>;

	constructor(
		private readonly authService: AuthService,

		@Inject(sessionConfig.KEY)
		sessionSettings: ConfigType<typeof sessionConfig>,

		@Inject(jwtConfig.KEY)
		jwtSettings: ConfigType<typeof jwtConfig>
	) {
		this.cookieConfig = createCookieConfig(sessionSettings, jwtSettings);
	}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Регистрация пользователя',
		description:
			'Создаёт нового пользователя по логину, email и паролю. ' +
			'Пароль сохраняется в виде Argon2-хэша. ' +
			'При успешной регистрации возвращается access JWT, ' +
			'а refresh JWT и идентификатор Redis-сессии ' +
			'устанавливаются через HttpOnly cookies.'
	})
	@ApiBody({
		type: RegisterDto,
		description: 'Данные нового пользователя'
	})
	@ApiCreatedResponse({
		description:
			'Пользователь создан. Access JWT возвращён в JSON. ' +
			'Cookies устанавливаются через Set-Cookie.',
		type: AuthDto
	})
	@ApiBadRequestResponse({
		description:
			'Ошибки валидации: некорректный email, ' +
			'неверные типы данных, недостаточная длина пароля, ' +
			'несовпадающие пароли или слишком длинное описание.',
		type: ApiErrorBadRequestDto
	})
	@ApiConflictResponse({
		description: 'Указанный логин или email уже существует.',
		type: ApiErrorConflictDto
	})
	public async register(
		@Body() dto: RegisterDto,
		@AuthSession() session: AuthSessionContext,
		@Res({ passthrough: true }) res: Response
	) {
		const auth = await this.authService.register(dto);

		return this.startSession(session, res, auth);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Вход пользователя',
		description:
			'Проверяет логин и пароль через Argon2. ' +
			'Создаёт новую авторизованную Redis-сессию. ' +
			'Возвращает access JWT и устанавливает cookies.'
	})
	@ApiBody({
		type: LoginDto,
		description: 'Учётные данные пользователя'
	})
	@ApiOkResponse({
		description: 'Пользователь успешно авторизован.',
		type: AuthDto
	})
	@ApiBadRequestResponse({
		description: 'Не передан логин или пароль либо нарушена валидация.',
		type: ApiErrorBadRequestDto
	})
	@ApiUnauthorizedResponse({
		description: 'Неверный логин, неправильный пароль или ' + 'учётная запись удалена.',
		type: ApiErrorUnauthorizedResponseDto
	})
	public async login(
		@Body() dto: LoginDto,
		@AuthSession() session: AuthSessionContext,
		@Res({ passthrough: true }) res: Response
	): Promise<{ accessToken: string }> {
		const auth = await this.authService.login(dto);

		return this.startSession(session, res, auth);
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@ApiCookieAuth('refreshToken')
	@ApiOperation({
		summary: 'Обновление JWT',
		description:
			'Не требует JSON-тела. Использует refreshToken ' +
			'из HttpOnly cookie и userId из Redis-сессии. ' +
			'Проверяет подпись JWT, срок действия, тип токена ' +
			'и соответствие идентификатора пользователя сессии. ' +
			'Для работы необходимы обе cookies. ' +
			'После проверки выдаёт новую пару JWT.'
	})
	@ApiOkResponse({
		description:
			'Новый access JWT возвращён в JSON, ' + 'refresh JWT обновлён через Set-Cookie.',
		type: AuthDto
	})
	@ApiUnauthorizedResponse({
		description:
			'Отсутствует сессия или refresh JWT, ' +
			'токен просрочен, повреждён, имеет неверный тип ' +
			'или не соответствует текущей сессии.',
		type: ApiErrorUnauthorizedResponseDto
	})
	public async refresh(
		@AuthSession() session: AuthSessionContext,
		@Res({ passthrough: true }) res: Response
	): Promise<{ accessToken: string }> {
		const auth = await this.authService.refresh({
			sessionUserId: session.userId,
			refreshToken: session.refreshToken,
			storedHash: session.refreshTokenHash
		});

		session.setRefreshTokenHash(hashRefreshToken(auth.refreshToken));

		await session.save();

		res.cookie(REFRESH_COOKIE, auth.refreshToken, this.cookieConfig.refreshCookieOptions);

		return {
			accessToken: auth.accessToken
		};
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Выход пользователя',
		description:
			'Удаляет текущую Redis-сессию и очищает cookies. ' +
			'Тело запроса не требуется. ' +
			'Уже выданный access JWT не отзывается автоматически ' +
			'и остаётся действительным до истечения его срока.'
	})
	@ApiOkResponse({
		description: 'Выход успешно выполнен.',
		type: LogoutResponseDto
	})
	public async logout(
		@AuthSession() session: AuthSessionContext,
		@Res({ passthrough: true }) res: Response
	): Promise<{ message: string }> {
		await session.destroy();

		res.clearCookie(REFRESH_COOKIE, this.cookieConfig.cookieOptions);

		res.clearCookie(this.cookieConfig.sessionName, this.cookieConfig.cookieOptions);

		return {
			message: AUTH_MESSAGES.LOGOUT_SUCCESS
		};
	}

	private async startSession(
		session: AuthSessionContext,
		res: Response,
		auth: AuthResult
	): Promise<{ accessToken: string }> {
		await session.regenerate();

		session.authenticate(auth.userId, hashRefreshToken(auth.refreshToken));

		await session.save();

		res.cookie(REFRESH_COOKIE, auth.refreshToken, this.cookieConfig.refreshCookieOptions);

		return {
			accessToken: auth.accessToken
		};
	}
}
