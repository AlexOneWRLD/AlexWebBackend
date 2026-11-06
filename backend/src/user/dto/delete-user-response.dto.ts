import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserResponseDto {
	@ApiProperty({
		description: 'Результат мягкого удаления аккаунта',
		example: 'Пользователь удален'
	})
	message!: string;
}
