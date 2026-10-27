import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
	@ApiProperty({
		description:
			'JWT access-токен для обращения к защищённым ' +
			'маршрутам. Передаётся в заголовке ' +
			'Authorization: Bearer <token>.',
		type: String,
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
	})
	accessToken: string;
}
