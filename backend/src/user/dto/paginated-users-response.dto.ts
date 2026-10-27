import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersResponseDto {
	@ApiProperty({
		description: 'Пользователи на текущей странице',
		type: [UserResponseDto]
	})
	users: UserResponseDto[];

	@ApiProperty({
		description: 'Общее количество пользователей, ' + 'соответствующих фильтру',
		example: 47
	})
	total: number;

	@ApiProperty({
		description: 'Номер текущей страницы',
		example: 2,
		minimum: 1
	})
	page: number;

	@ApiProperty({
		description: 'Максимальное количество записей на странице',
		example: 12,
		minimum: 1,
		maximum: 150
	})
	limit: number;

	@ApiProperty({
		description: 'Общее количество страниц',
		example: 4,
		minimum: 0
	})
	totalPages: number;
}
