import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorUnauthorizedResponseDto {
	@ApiProperty({
		description: 'HTTP-код ошибки. Всегда 401.',
		example: 401
	})
	statusCode: number;

	@ApiProperty({
		description:
			'Сообщение о причине отказа в аутентификации. ' +
			'Ошибка возникает при отсутствии, недействительности ' +
			'или истечении срока действия учётных данных.',
		example: 'Unauthorized'
	})
	message: string;

	@ApiProperty({
		description: 'Стандартное название HTTP-ошибки',
		example: 'Unauthorized'
	})
	error: string;
}
