import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserUpdateDto {
	@ApiProperty({
		description: 'Новое отображаемое имя',
		minLength: 2,
		example: 'Alexander'
	})
	@IsString({ message: 'Имя должно быть строкой' })
	@MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
	@IsNotEmpty({ message: 'Имя обязательно для заполнения' })
	name: string;

	@ApiProperty({
		description: 'Новый уникальный логин',
		minLength: 2,
		example: 'AlexBackend'
	})
	@IsString({ message: 'Логин должен быть строкой' })
	@MinLength(2, { message: 'Логин должен содержать минимум 2 символа' })
	@IsNotEmpty({ message: 'Логин обязателен для заполнения' })
	login: string;

	@ApiProperty({
		description: 'Новый уникальный email',
		format: 'email',
		example: 'alex@example.com'
	})
	@IsString({ message: 'Email должен быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат email' })
	@IsNotEmpty({ message: 'Email обязателен для заполнения' })
	email: string;

	@ApiProperty({
		description: 'Новый пароль профиля',
		example: '1234546dsaasdS!'
	})
	@IsString({ message: 'Пароль должен быть строкой' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
	password: string;

	@ApiProperty({
		description: 'Возраст пользователя',
		minimum: 1,
		maximum: 120,
		example: 28
	})
	@IsInt({ message: 'Возраст должен быть числом' })
	age: number;

	@ApiProperty({
		description: 'Новое описание профиля',
		maxLength: 1000,
		example: 'Изучаю NestJS'
	})
	@IsString({ message: 'Описание должно быть строкой' })
	@MinLength(2, {
		message: 'Описание должно содержать минимум 2 символа'
	})
	description: string;
}
