import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserUpdateDto {
	@IsString({ message: 'Имя должно быть строкой' })
	@IsNotEmpty({ message: 'Имя обязательно для заполнения' })
	name: string;

	@IsString({ message: 'Email должно быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат email' })
	@IsNotEmpty({ message: 'Email обязателен для заполнения' })
	email: string;

	@IsString({ message: 'Пароль должно быть строкой' })
	@IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
	password: string;

	@IsString({ message: 'Пароль подтверждения должно быть строкой' })
	@IsNotEmpty({ message: 'Пароль подтверждения обязателен для заполнения' })
	@MinLength(6, {
		message: 'Пароль подтверждения должен содержать минимум 6 символов'
	})
	passwordRepeat: string;
}
