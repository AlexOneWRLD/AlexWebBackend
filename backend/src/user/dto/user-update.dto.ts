import { OmitType, PartialType } from '@nestjs/swagger';
import { RegisterDto } from '@/auth/dto/register.dto';

export class UserUpdateDto extends PartialType(
	OmitType(RegisterDto, ['password', 'passwordRepeat'])
) {}
