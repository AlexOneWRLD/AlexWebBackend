import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConflictResponse,
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Authorization } from '@/auth/decorators/authorization.decorator';
import { Authorized } from '@/auth/decorators/authorized.decorator';
import { ApiErrorBadRequestDto } from '@/common/dto/api-error-bad-request.dto';
import { ApiErrorConflictDto } from '@/common/dto/api-error-conflict.dto';
import { ApiErrorUnauthorizedResponseDto } from '@/common/dto/api-error-unauthorized.dto';
import { ProfileResponseDto } from '@/user/dto/user-response.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// POST /auth/register

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
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Body() dto: RegisterDto
	) {
		return this.authService.register(req, res, dto);
	}

	// POST /auth/login

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
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Body() dto: LoginDto
	) {
		return this.authService.login(req, res, dto);
	}

	// POST /auth/refresh

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
	public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		return this.authService.refresh(req, res);
	}

	// POST /auth/logout

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
	public logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		return this.authService.logout(req, res);
	}

	// GET /auth/@me

	@Get('@me')
	@Authorization()
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Получение текущего пользователя',
		description:
			'Альтернативный маршрут собственного профиля. ' +
			'Пользователь определяется по access JWT. ' +
			'ID не передаётся в URL.'
	})
	@ApiOkResponse({
		description: 'Профиль текущего пользователя без хэша пароля.',
		type: ProfileResponseDto
	})
	@ApiUnauthorizedResponse({
		description: 'Access JWT отсутствует, недействителен, ' + 'просрочен или аккаунт удалён.',
		type: ApiErrorUnauthorizedResponseDto
	})
	public me(@Authorized() user: unknown) {
		return user;
	}
}
