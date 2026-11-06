import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle('AlexWebBackend API')
		.setDescription(
			'REST API для регистрации, авторизации, ' +
				'получения, обновления и мягкого удаления пользователей. ' +
				'Access JWT передаётся через Authorization: Bearer, ' +
				'refresh JWT и идентификатор сессии — через cookies.'
		)
		.setVersion('1.0.0')
		.addBearerAuth()
		.addCookieAuth('refreshToken')
		.build();
}
