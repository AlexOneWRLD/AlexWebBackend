import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Query } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConflictResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { Authorization } from '@/auth/decorators/authorization.decorator';
import { Authorized } from '@/auth/decorators/authorized.decorator';
import { ApiErrorBadRequestDto } from '@/common/dto/api-error-bad-request.dto';
import { ApiErrorConflictDto } from '@/common/dto/api-error-conflict.dto';
import { ApiErrorNotFoundDto } from '@/common/dto/api-error-not-found.dto';
import { ApiErrorUnauthorizedResponseDto } from '@/common/dto/api-error-unauthorized.dto';
import { ChangePasswordDto } from '@/user/dto/change-password.dto';
import { DeleteUserResponseDto } from './dto/delete-user-response.dto';
import { PaginatedUsersResponseDto } from './dto/paginated-users-response.dto';
import { ProfileResponseDto } from './dto/user-response.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Authorization()
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	// GET /auth/@me
	@Get('me')
	@ApiOperation({
		summary: 'Получение собственного профиля',
		description:
			'Возвращает информацию об авторизованном ' +
			'пользователе. ID берётся из access JWT, ' +
			'поэтому передавать ID в URL не нужно. ' +
			'Хэш пароля не включается в ответ.'
	})
	@ApiOkResponse({
		description: 'Профиль успешно получен.',
		type: ProfileResponseDto
	})
	@ApiUnauthorizedResponse({
		description: 'Токен отсутствует, недействителен, ' + 'просрочен или аккаунт удалён.',
		type: ApiErrorUnauthorizedResponseDto
	})
	public getMe(@Authorized('id') id: string) {
		return this.userService.findById(id);
	}

	@Get()
	@ApiOperation({
		summary: 'Получение списка пользователей',
		description:
			'Возвращает активных пользователей с пагинацией. ' +
			'Поддерживает фильтрацию по логину без учёта регистра. ' +
			'Не возвращает пароль и мягко удалённые записи. ' +
			'Значения по умолчанию: page=1, limit=12.'
	})
	@ApiOkResponse({
		description: 'Список пользователей и метаданные пагинации.',
		type: PaginatedUsersResponseDto
	})
	@ApiBadRequestResponse({
		description:
			'Некорректные параметры пагинации: page меньше 1, ' +
			'limit вне диапазона 1–150 или неверные типы.',
		type: ApiErrorBadRequestDto
	})
	@ApiUnauthorizedResponse({
		description: 'Необходим действительный access JWT.',
		type: ApiErrorUnauthorizedResponseDto
	})
	public getUsers(@Query() query: UsersQueryDto) {
		return this.userService.getUsers(query);
	}

	@Patch('me')
	@ApiOperation({
		summary: 'Частичное обновление профиля',
		description:
			'Позволяет изменить имя, логин, email, возраст ' +
			'или описание текущего пользователя. ' +
			'Можно передавать только изменяемые поля. ' +
			'Пароль, баланс и роль нельзя менять этим методом.'
	})
	@ApiBody({
		type: UserUpdateDto,
		description: 'Поля профиля, которые необходимо обновить.'
	})
	@ApiOkResponse({
		description: 'Данные успешно обновлены. ' + 'Возвращается актуальный профиль без пароля.',
		type: ProfileResponseDto
	})
	@ApiBadRequestResponse({
		description:
			'Передан пустой объект, неверные данные ' + 'или поля, запрещённые к изменению.',
		type: ApiErrorBadRequestDto
	})
	@ApiUnauthorizedResponse({
		description: 'Необходим действительный access JWT.',
		type: ApiErrorUnauthorizedResponseDto
	})
	@ApiNotFoundResponse({
		description: 'Аккаунт не найден в момент выполнения обновления.',
		type: ApiErrorNotFoundDto
	})
	@ApiConflictResponse({
		description: 'Указанный логин или email уже используется.',
		type: ApiErrorConflictDto
	})
	public updateMe(@Authorized('id') id: string, @Body() dto: UserUpdateDto) {
		return this.userService.updateUser(id, dto);
	}

	@Patch('me/password')
	@ApiOperation({
		summary: 'Изменение пароля пользователя',
		description:
			'Позволяет авторизованному пользователю ' +
			'изменить пароль после проверки текущего. ' +
			'Новый пароль сохраняется в виде Argon2-хэша.'
	})
	@ApiBody({
		type: ChangePasswordDto,
		description: 'Поля который понадабятся для изменения пароля'
	})
	@ApiOkResponse({
		description: 'Пароль успешно изменён',
		schema: {
			example: {
				message: 'Пароль успешно изменён'
			}
		}
	})
	@ApiBadRequestResponse({
		description:
			'Неверный текущий пароль, несовпадающие новые ' + 'пароли или ошибка валидации',
		type: ApiErrorBadRequestDto
	})
	@ApiUnauthorizedResponse({
		description: 'Необходим действительный access JWT.',
		type: ApiErrorUnauthorizedResponseDto
	})
	@ApiNotFoundResponse({
		description: 'Аккаунт не найден в момент выполнения обновления.',
		type: ApiErrorNotFoundDto
	})
	@ApiConflictResponse({
		description: 'Пароль был изменен другим запросом'
	})
	public updatePassword(@Authorized('id') id: string, @Body() dto: ChangePasswordDto) {
		return this.userService.updatePassword(id, dto);
	}

	@Delete('me')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Мягкое удаление собственного аккаунта',
		description:
			'Выполняет soft delete: заполняет поле deletedAt, ' +
			'но физически не удаляет запись из PostgreSQL. ' +
			'После этого аккаунт исключается из списка, ' +
			'а его access JWT перестаёт проходить проверку.'
	})
	@ApiOkResponse({
		description: 'Аккаунт успешно помечен удалённым.',
		type: DeleteUserResponseDto
	})
	@ApiUnauthorizedResponse({
		description: 'Access JWT отсутствует, недействителен ' + 'или аккаунт уже удалён.',
		type: ApiErrorUnauthorizedResponseDto
	})
	@ApiNotFoundResponse({
		description:
			'При удалении не найден активный пользователь. ' +
			'Например, запись была удалена параллельным запросом.',
		type: ApiErrorNotFoundDto
	})
	public deleteMe(@Authorized('id') id: string) {
		return this.userService.deleteUser(id);
	}
}
