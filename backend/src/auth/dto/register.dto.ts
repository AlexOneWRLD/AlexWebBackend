import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { IsPasswordMatchingConstraint } from '../../../libs/common/decorators/is-password-matching-constrain.decorator';

export class RegisterDto {
	@ApiProperty({
		description: 'Отображаемое имя',
		example: 'Alex Ovsyannikov'
	})
	@IsString({ message: 'Имя должно быть строкой' })
	@IsNotEmpty({ message: 'Имя обязательно для заполнения' })
	name: string;

	@ApiProperty({
		description: 'Почтовый адрес',
		example: 'abwgt@gmail.ru'
	})
	@IsString({ message: 'Email должно быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат email' })
	@IsNotEmpty({ message: 'Email обязателен для заполнения' })
	email: string;

	@ApiProperty({
		description: 'Возраст',
		example: '28'
	})
	@IsInt({ message: 'Возраст должен быть числом' })
	@IsNotEmpty({ message: 'Возраст обязателен для заполнения' })
	age: number;

	@ApiProperty({
		description: 'Описание',
		example: 'Я лучший программист'
	})
	@IsString({ message: 'Описание должно быть строкой' })
	@IsNotEmpty({ message: 'Описание обязательно для заполнения' })
	description: string;

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

	@ApiProperty({
		description: 'Повторение пароля от аккаунта',
		example: '12345',
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Пароль подтверждения должно быть строкой' })
	@IsNotEmpty({ message: 'Пароль подтверждения обязателен для заполнения' })
	@MinLength(6, {
		message: 'Пароль подтверждения должен содержать минимум 6 символов'
	})
	@Validate(IsPasswordMatchingConstraint, {
		message: 'Пароли не совпадают'
	})
	passwordRepeat: string;
}
