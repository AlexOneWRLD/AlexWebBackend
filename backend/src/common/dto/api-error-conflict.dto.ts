import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorConflictDto {
	@ApiProperty({
		description: 'HTTP-код ошибки. Всегда 409.',
		example: 409
	})
	statusCode: number;

	@ApiProperty({
		description:
			'Сообщение о конфликте с текущим состоянием ресурса. ' +
			'Возникает, например, при попытке создания записи ' +
			'с уже существующим уникальным значением ' +
			'или при нарушении ограничений бизнес-логики.',
		example: 'Пользователь с таким email уже существует'
	})
	message: string;

	@ApiProperty({
		description: 'Стандартное название HTTP-ошибки',
		example: 'Conflict'
	})
	error: string;
}
