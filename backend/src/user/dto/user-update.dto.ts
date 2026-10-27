import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserUpdateDto {
	@ApiPropertyOptional({
		description: 'Новое отображаемое имя',
		minLength: 2,
		example: 'Alexander'
	})
	@IsString({ message: 'Имя должно быть строкой' })
	@MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
	@IsNotEmpty({ message: 'Имя обязательно для заполнения' })
	name: string;

	@ApiPropertyOptional({
		description: 'Новый уникальный логин',
		minLength: 2,
		example: 'AlexBackend'
	})
	@IsString({ message: 'Логин должно быть строкой' })
	@MinLength(2, { message: 'Логин должен содержать минимум 2 символа' })
	@IsNotEmpty({ message: 'Логин обязателен для заполнения' })
	login: string;

	@ApiPropertyOptional({
		description: 'Новый уникальный email',
		format: 'email',
		example: 'alex@example.com'
	})
	@IsString({ message: 'Email должно быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат email' })
	@IsNotEmpty({ message: 'Email обязателен для заполнения' })
	email: string;

	@ApiPropertyOptional({
		description: 'Новый пароль профиля',
		example: '1234546dsaasdS!'
	})
	@IsString({ message: 'Пароль должно быть строкой' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
	password: string;

	@ApiPropertyOptional({
		description: 'Возраст пользователя',
		minimum: 1,
		maximum: 120,
		example: 28
	})
	@IsInt({ message: 'Возраст должен быть числом' })
	age: number;

	@ApiPropertyOptional({
		description: 'Новое описание профиля',
		maxLength: 1000,
		example: 'Изучаю NestJS'
	})
	@IsString({ message: 'Описание должно быть строкой' })
	@MinLength(2, {
		message: 'Описание должено содержать минимум 2 символа'
	})
	description: string;
}
