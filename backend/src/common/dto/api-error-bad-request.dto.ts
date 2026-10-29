import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorBadRequestDto {
	@ApiProperty({
		description: 'HTTP-код ошибки. Всегда 400.',
		example: 400
	})
	statusCode!: number;

	@ApiProperty({
		description:
			'Описание причины некорректного запроса. ' +
			'Содержит строковое сообщение об ошибке ' +
			'или массив сообщений при нарушении правил валидации.',
		oneOf: [
			{ type: 'string' },
			{
				type: 'array',
				items: { type: 'string' }
			}
		],
		example: [
			'Email должен иметь корректный формат',
			'Пароль должен содержать минимум 8 символов'
		]
	})
	message!: string | string[];

	@ApiProperty({
		description: 'Стандартное название HTTP-ошибки',
		example: 'Bad Request'
	})
	error!: string;
}
