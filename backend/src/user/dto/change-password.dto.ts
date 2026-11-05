import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { USER_RULES } from '@/common/constants/user-rules.constants';
import { VALIDATION_MESSAGES } from '@/common/constants/validation.messages';
import { Match } from '@/common/decorators/match.decorator';

export class ChangePasswordDto {
	@ApiProperty({
		description: 'Текущий пароль пользователя',
		example: 'OldPassword123!',
		minLength: USER_RULES.PASSWORD.MIN_LENGTH,
		maxLength: USER_RULES.PASSWORD.MAX_LENGTH,
		format: 'password'
	})
	@IsString({
		message: VALIDATION_MESSAGES.PASSWORD.STRING
	})
	@IsNotEmpty({
		message: VALIDATION_MESSAGES.PASSWORD.REQUIRED
	})
	@MinLength(USER_RULES.PASSWORD.MIN_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH })
	@MaxLength(USER_RULES.PASSWORD.MAX_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD.MAX_LENGTH })
	currentPassword!: string;

	@ApiProperty({
		description: 'Новый пароль пользователя',
		example: 'NewPassword456!',
		minLength: USER_RULES.PASSWORD.MIN_LENGTH,
		maxLength: USER_RULES.PASSWORD.MAX_LENGTH,
		format: 'password'
	})
	@IsString({
		message: VALIDATION_MESSAGES.NEW_PASSWORD.STRING
	})
	@IsNotEmpty({
		message: VALIDATION_MESSAGES.NEW_PASSWORD.REQUIRED
	})
	@MinLength(USER_RULES.PASSWORD.MIN_LENGTH, {
		message: VALIDATION_MESSAGES.NEW_PASSWORD.MIN_LENGTH
	})
	@MaxLength(USER_RULES.PASSWORD.MAX_LENGTH, {
		message: VALIDATION_MESSAGES.NEW_PASSWORD.MAX_LENGTH
	})
	newPassword!: string;

	@ApiProperty({
		description: 'Подтверждение нового пароля',
		example: 'NewPassword456!',
		minLength: USER_RULES.PASSWORD.MIN_LENGTH,
		maxLength: USER_RULES.PASSWORD.MAX_LENGTH,
		format: 'password'
	})
	@IsString({
		message: VALIDATION_MESSAGES.NEW_PASSWORD_REPEAT.STRING
	})
	@IsNotEmpty({
		message: VALIDATION_MESSAGES.NEW_PASSWORD_REPEAT.REQUIRED
	})
	@MinLength(USER_RULES.PASSWORD.MIN_LENGTH, {
		message: VALIDATION_MESSAGES.NEW_PASSWORD_REPEAT.MIN_LENGTH
	})
	@MaxLength(USER_RULES.PASSWORD.MAX_LENGTH, {
		message: VALIDATION_MESSAGES.NEW_PASSWORD_REPEAT.MAX_LENGTH
	})
	@Match('newPassword', {
		message: VALIDATION_MESSAGES.NEW_PASSWORD_REPEAT.MISMATCH
	})
	newPasswordRepeat!: string;
}
