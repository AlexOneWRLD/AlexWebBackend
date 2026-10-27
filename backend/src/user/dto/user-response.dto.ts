import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
	@ApiProperty({
		description: 'Уникальный идентификатор пользователя',
		format: 'uuid',
		example: 'b3bb9ad8-dfd0-4f9b-8ec3-e54457c624bd'
	})
	id: string;

	@ApiProperty({
		description: 'Уникальный логин пользователя',
		example: 'AlexOneWRLD'
	})
	login: string;

	@ApiProperty({
		description: 'Отображаемое имя пользователя',
		example: 'Alexander'
	})
	name: string;

	@ApiProperty({
		description: 'Электронная почта пользователя',
		format: 'email',
		example: 'alex@example.com'
	})
	email: string;

	@ApiProperty({
		description: 'Возраст пользователя',
		type: Number,
		nullable: true,
		example: 28
	})
	age: number | null;

	@ApiProperty({
		description: 'Описание профиля',
		type: String,
		nullable: true,
		maxLength: 1000,
		example: 'Backend Developer'
	})
	description: string | null;

	@ApiProperty({
		description: 'Ссылка на изображение профиля',
		type: String,
		nullable: true,
		example: ''
	})
	picture: string | null;

	@ApiProperty({
		description: 'Роль пользователя',
		enum: UserRole,
		enumName: 'UserRole',
		example: UserRole.REGULAR
	})
	role: UserRole;

	@ApiProperty({
		description: 'Дата регистрации',
		format: 'date-time',
		example: '2026-10-27T08:00:00.000Z'
	})
	createdAt: string;

	@ApiProperty({
		description: 'Дата последнего обновления',
		format: 'date-time',
		example: '2026-10-27T08:30:00.000Z'
	})
	updatedAt: string;
}

export class ProfileResponseDto extends UserResponseDto {
	@ApiProperty({
		description: 'Баланс пользователя в десятичном формате',
		type: String,
		example: '0.00'
	})
	balance: string;

	@ApiProperty({
		description: 'Дата мягкого удаления аккаунта. ' + 'Для активного пользователя равна null.',
		type: String,
		format: 'date-time',
		nullable: true,
		example: null
	})
	deletedAt: string | null;
}
