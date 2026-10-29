import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { USER_RULES } from '@/common/constants/user-rules.constants';

export class ChangePasswordDto {
	@ApiProperty({
		description: 'Текущий пароль пользователя',
		example: 'OldPassword123!',
		minLength: USER_RULES.PASSWORD.MIN_LENGTH,
		maxLength: USER_RULES.PASSWORD.MAX_LENGTH,
		format: 'password'
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(USER_RULES.PASSWORD.MIN_LENGTH)
	@MaxLength(USER_RULES.PASSWORD.MAX_LENGTH)
	currentPassword!: string;

	@ApiProperty({
		description: 'Новый пароль пользователя',
		example: 'NewPassword456!',
		minLength: USER_RULES.PASSWORD.MIN_LENGTH,
		maxLength: USER_RULES.PASSWORD.MAX_LENGTH,
		format: 'password'
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(USER_RULES.PASSWORD.MIN_LENGTH)
	@MaxLength(USER_RULES.PASSWORD.MAX_LENGTH)
	newPassword!: string;

	@ApiProperty({
		description: 'Подтверждение нового пароля',
		example: 'NewPassword456!',
		minLength: USER_RULES.PASSWORD.MIN_LENGTH,
		maxLength: USER_RULES.PASSWORD.MAX_LENGTH,
		format: 'password'
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(USER_RULES.PASSWORD.MIN_LENGTH)
	@MaxLength(USER_RULES.PASSWORD.MAX_LENGTH)
	newPasswordRepeat!: string;
}
