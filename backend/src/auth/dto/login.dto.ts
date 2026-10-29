import { OmitType } from '@nestjs/mapped-types';
import { RegisterDto } from '@/auth/dto/register.dto';

export class LoginDto extends OmitType(RegisterDto, [
	'passwordRepeat',
	'description',
	'age',
	'email',
	'name'
]) {}
