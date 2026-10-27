import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorNotFoundDto {
	@ApiProperty({
		description: 'HTTP-код ошибки. Всегда 404.',
		example: 404
	})
	statusCode: number;

	@ApiProperty({
		description:
			'Сообщение об отсутствии запрашиваемого ресурса. ' +
			'Возникает, если ресурс не существует, был удалён ' +
			'или недоступен для поиска.',
		example: 'Пользователь не найден'
	})
	message: string;

	@ApiProperty({
		description: 'Стандартное название HTTP-ошибки',
		example: 'Not Found'
	})
	error: string;
}
