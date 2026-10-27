import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Authorizantion } from '@/auth/decorators/authorization.decorator';
import { Authorized } from '@/auth/decorators/authorized.decorator';
import { RegisterDto } from '@/auth/dto/register.dto';
import { UsersQueryDto } from '@/user/dto/users-query.dto';
import { UserService } from '@/user/user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Authorizantion()
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({
		summary: 'Получение пользователя по id',
		description: 'Поиск среди всех юзеров по уникальному id'
	})
	@Get('me')
	getMe(@Authorized('id') id: string) {
		return this.userService.findById(id);
	}

	@ApiOperation({
		summary: 'Получение всех пользователей'
	})
	@Get()
	getUsers(@Query() query: UsersQueryDto) {
		return this.userService.getUsers(query);
	}

	@ApiOperation({
		summary: 'Изменение данных у пользователя',
		description: 'Позволяет полностью или частично поменять данные у одного пользователя'
	})
	@Patch('me')
	updateUser(@Authorized('id') id: string, @Body() dto: RegisterDto) {
		return this.userService.updateUser(id, dto);
	}

	@ApiOperation({
		summary: 'Мягкое удаление пользователя',
		description: 'Позволяет удалить пользователя, но оставляет его в базе данных'
	})
	@Delete('me')
	deleteUser(@Authorized('id') id: string) {
		return this.userService.deleteUser(id);
	}
}
