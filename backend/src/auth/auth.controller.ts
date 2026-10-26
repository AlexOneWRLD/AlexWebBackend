import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request } from 'express';
import { Response } from 'express';
import { Authorizantion } from '@/auth/decorators/authorization.decorator';
import { Authorized } from '@/auth/decorators/authorized.decorator';
import { AuthDto } from '@/auth/dto/auth.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({
		summary: 'Создание аккаунта',
		description: 'Создает новый аккаунт пользователя'
	})
	@ApiCreatedResponse({ type: AuthDto })
	@ApiBadRequestResponse({ description: 'Некорректные данные' })
	@ApiConflictResponse({ description: 'Пользователь с тåакой почтой уже существует' })
	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	public async register(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Body() dto: RegisterDto
	) {
		return this.authService.register(req, res, dto);
	}

	@ApiOperation({
		summary: 'Вход в систему',
		description: 'Авторизует пользователя и выдает токен доступа'
	})
	@ApiOkResponse({ type: AuthDto })
	@ApiBadRequestResponse({ description: 'Некорректные данные' })
	@ApiNotFoundResponse({ description: 'Пользователь не найден' })
	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Body() dto: LoginDto
	) {
		return this.authService.login(req, res, dto);
	}

	@ApiOperation({
		summary: 'Обновление токена',
		description: 'Генерирует новый токен доступа'
	})
	@ApiOkResponse({ type: AuthDto })
	@ApiUnauthorizedResponse({ description: 'Недействительный refresh-токен' })
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		return this.authService.refresh(req, res);
	}

	//должен быть ассинхронный
	@ApiOperation({
		summary: 'Выход из системы'
	})
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		return this.authService.logout(req, res);
	}

	@Authorizantion()
	@Get('@me')
	@HttpCode(HttpStatus.OK)
	async me(@Authorized() user: User) {
		return user;
	}
}
