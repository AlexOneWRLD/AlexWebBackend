import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserUpdateDto {
	@IsString({ message: 'Имя должно быть строкой' })
	@MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
	@IsNotEmpty({ message: 'Имя обязательно для заполнения' })
	name: string;

	@IsString({ message: 'Логин должно быть строкой' })
	@MinLength(2, { message: 'Логин должен содержать минимум 2 символа' })
	@IsNotEmpty({ message: 'Логин обязателен для заполнения' })
	login: string;

	@IsString({ message: 'Email должно быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат email' })
	@IsNotEmpty({ message: 'Email обязателен для заполнения' })
	email: string;

	@IsString({ message: 'Пароль должно быть строкой' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
	password: string;

	@IsInt({ message: 'Возраст должен быть числом' })
	age: number;

	@IsString({ message: 'Описание должно быть строкой' })
	@MinLength(2, {
		message: 'Описание должено содержать минимум 2 символа'
	})
	description: string;
}
