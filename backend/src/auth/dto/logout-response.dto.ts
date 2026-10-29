import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
	@ApiProperty({
		description: 'Результат выхода из системы',
		example: 'Выход выполнен'
	})
	message!: string;
}
