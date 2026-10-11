import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
	@ApiProperty({
		description: 'JWT access token',
		example: 'pmHnsaJGJNsaHN12KasdhA312dsaASDffwe12...'
	})
	accessToken: string;
}
