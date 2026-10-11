import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle('Awesome API')
		.setDescription('A simple adn powerful REST API build with NestJS')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
}
