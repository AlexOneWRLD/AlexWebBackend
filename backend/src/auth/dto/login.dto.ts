import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
	@ApiProperty({
		description: 'Логин',
		example: 'AlexOneWRLD'
	})
	@IsString({ message: 'Логин должен быть строкой' })
	@IsNotEmpty({ message: 'Логин обязателен для заполнения' })
	login: string;

	@ApiProperty({
		description: 'Пароль от аккаунта',
		example: '12345',
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Пароль должно быть строкой' })
	@IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
	@MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
	password: string;
}
