import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { PAGINATION_RULES } from '@/common/constants/pagination-rules.constants';

export class UsersQueryDto {
	@ApiPropertyOptional({
		description: 'Номер страницы',
		default: PAGINATION_RULES.DEFAULT_PAGE,
		minimum: PAGINATION_RULES.MIN_PAGE
	})
	@Type(() => Number)
	@IsInt()
	@Min(PAGINATION_RULES.DEFAULT_PAGE)
	page: number = PAGINATION_RULES.DEFAULT_PAGE;

	@ApiPropertyOptional({
		description: 'Количество пользователей на странице',
		default: PAGINATION_RULES.DEFAULT_LIMIT,
		minimum: PAGINATION_RULES.MIN_LIMIT,
		maximum: PAGINATION_RULES.MAX_LIMIT
	})
	@Type(() => Number)
	@IsInt()
	@Min(PAGINATION_RULES.MIN_LIMIT)
	@Max(PAGINATION_RULES.MAX_LIMIT)
	limit: number = PAGINATION_RULES.DEFAULT_LIMIT;

	@ApiPropertyOptional({
		description: 'Поиск пользователей по логину',
		maxLength: PAGINATION_RULES.MAX_SEARCH_LENGTH
	})
	@IsOptional()
	@IsString()
	@MaxLength(PAGINATION_RULES.MAX_SEARCH_LENGTH)
	search?: string | null;
}
