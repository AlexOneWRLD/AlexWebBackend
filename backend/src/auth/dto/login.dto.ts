import { OmitType } from '@nestjs/swagger';
import { RegisterDto } from '@/auth/dto/register.dto';

export class LoginDto extends OmitType(RegisterDto, [
	'passwordRepeat',
	'description',
	'age',
	'email',
	'name'
]) {}
