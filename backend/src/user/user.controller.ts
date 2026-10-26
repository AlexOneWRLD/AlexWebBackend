import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Authorized } from '@/auth/decorators/authorized.decorator';
import { RegisterDto } from '@/auth/dto/register.dto';
import { UsersQueryDto } from '@/user/dto/users-query.dto';
import { UserService } from '@/user/user.service';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({
		summary: 'Получение пользователя по id',
		description: 'Поиск среди всех юзеров по уникальному id'
	})
	@Get(':id')
	getUsersById(@Authorized('id') id: string) {
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
	@Post(':id')
	updateUser(@Authorized('id') id: string, @Body() dto: RegisterDto) {
		return this.userService.updateUser(id, dto);
	}

	@ApiOperation({
		summary: 'Мягкое удаление пользователя',
		description: 'Позволяет удалить пользователя, но оставляет его в базе данных'
	})
	@Delete(':id')
	deleteUser(@Authorized('id') id: string) {
		return this.userService.deleteUser(id);
	}
}
