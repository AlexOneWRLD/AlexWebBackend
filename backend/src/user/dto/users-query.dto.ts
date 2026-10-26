import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UsersQueryDto {
	@ApiPropertyOptional({ default: 1 })
	@IsInt()
	@Min(1)
	page: number = 1;

	@ApiPropertyOptional({ default: 12 })
	@IsInt()
	@Min(1)
	@Max(100)
	limit: number = 12;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(100)
	search?: string;
}
