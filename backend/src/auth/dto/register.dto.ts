import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsDefined,
	IsEmail,
	IsInt,
	IsNotEmpty,
	IsString,
	Matches,
	Max,
	MaxLength,
	Min,
	MinLength,
	Validate
} from 'class-validator';
import { USER_RULES } from '@/common/constants/user-rules.constants';
import { VALIDATION_MESSAGES } from '@/common/constants/validation.messages';
import { IsPasswordMatchingConstraint } from '@/common/decorators/is-password-matching-constraint.decorator';

export class RegisterDto {
	@ApiProperty({
		description: 'Отображаемое имя',
		example: 'Alex Ovsyannikov',
		minLength: USER_RULES.NAME.MIN_LENGTH,
		maxLength: USER_RULES.NAME.MAX_LENGTH
	})
	@IsString({ message: VALIDATION_MESSAGES.NAME.STRING })
	@IsNotEmpty({ message: VALIDATION_MESSAGES.NAME.REQUIRED })
	@MinLength(USER_RULES.NAME.MIN_LENGTH, { message: VALIDATION_MESSAGES.NAME.MIN_LENGTH })
	@MaxLength(USER_RULES.NAME.MAX_LENGTH, { message: VALIDATION_MESSAGES.NAME.MAX_LENGTH })
	name!: string;

	@ApiProperty({
		description: 'Почтовый адрес',
		example: 'alex@gmail.com',
		maxLength: USER_RULES.EMAIL.MAX_LENGTH
	})
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim().toLowerCase() : value
	)
	@IsString({
		message: VALIDATION_MESSAGES.EMAIL.STRING
	})
	@IsNotEmpty({
		message: VALIDATION_MESSAGES.EMAIL.REQUIRED
	})
	@IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL.FORMAT })
	@MaxLength(USER_RULES.EMAIL.MAX_LENGTH)
	email!: string;

	@ApiProperty({
		description: 'Уникальный логин',
		example: 'AlexOneWRLD',
		minLength: USER_RULES.LOGIN.MIN_LENGTH,
		maxLength: USER_RULES.LOGIN.MAX_LENGTH,
		pattern: USER_RULES.LOGIN.PATTERN.source
	})
	@IsString({
		message: VALIDATION_MESSAGES.LOGIN.STRING
	})
	@IsNotEmpty({
		message: VALIDATION_MESSAGES.LOGIN.REQUIRED
	})
	@MinLength(USER_RULES.LOGIN.MIN_LENGTH, {
		message: VALIDATION_MESSAGES.LOGIN.MIN_LENGTH
	})
	@MaxLength(USER_RULES.LOGIN.MAX_LENGTH, {
		message: VALIDATION_MESSAGES.LOGIN.MAX_LENGTH
	})
	@Matches(USER_RULES.LOGIN.PATTERN, {
		message: VALIDATION_MESSAGES.LOGIN.FORMAT
	})
	login!: string;

	@ApiProperty({
		description: 'Возраст пользователя',
		example: 28,
		required: true,
		minimum: USER_RULES.AGE.MIN,
		maximum: USER_RULES.AGE.MAX
	})
	@IsDefined({
		message: VALIDATION_MESSAGES.AGE.REQUIRED
	})
	@IsInt({
		message: VALIDATION_MESSAGES.AGE.INTEGER
	})
	@Min(USER_RULES.AGE.MIN, {
		message: VALIDATION_MESSAGES.AGE.MIN
	})
	@Max(USER_RULES.AGE.MAX, {
		message: VALIDATION_MESSAGES.AGE.MAX
	})
	age!: number;

	@ApiProperty({
		description: 'Описание пользователя',
		example: 'Backend Developer',
		minLength: USER_RULES.DESCRIPTION.MIN_LENGTH,
		maxLength: USER_RULES.DESCRIPTION.MAX_LENGTH
	})
	@IsString({
		message: VALIDATION_MESSAGES.DESCRIPTION.STRING
	})
	@IsNotEmpty({
		message: VALIDATION_MESSAGES.DESCRIPTION.REQUIRED
	})
	@MinLength(USER_RULES.DESCRIPTION.MIN_LENGTH, {
		message: VALIDATION_MESSAGES.DESCRIPTION.MIN_LENGTH
	})
	@MaxLength(USER_RULES.DESCRIPTION.MAX_LENGTH, {
		message: VALIDATION_MESSAGES.DESCRIPTION.MAX_LENGTH
	})
	description!: string;

	@ApiProperty({
		description: 'Пароль пользователя',
		example: 'Password123!',
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
	@MinLength(USER_RULES.PASSWORD.MIN_LENGTH, {
		message: VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH
	})
	@MaxLength(USER_RULES.PASSWORD.MAX_LENGTH, {
		message: VALIDATION_MESSAGES.PASSWORD.MAX_LENGTH
	})
	password!: string;

	@ApiProperty({
		description: 'Подтверждение пароля',
		example: 'Password123!',
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
	@MinLength(USER_RULES.PASSWORD.MIN_LENGTH, {
		message: VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH
	})
	@MaxLength(USER_RULES.PASSWORD.MAX_LENGTH, {
		message: VALIDATION_MESSAGES.PASSWORD.MAX_LENGTH
	})
	@Validate(IsPasswordMatchingConstraint, {
		message: VALIDATION_MESSAGES.PASSWORD.MISMATCH
	})
	passwordRepeat!: string;
}
