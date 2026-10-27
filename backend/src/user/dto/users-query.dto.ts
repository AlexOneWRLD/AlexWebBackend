import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UsersQueryDto {
	@ApiPropertyOptional({ default: 1 })
	@IsInt()
	@Min(1)
	@Type(() => Number)
	page: number = 1;

	@ApiPropertyOptional({ default: 12 })
	@IsInt()
	@Min(1)
	@Max(150)
	@Type(() => Number)
	limit: number = 12;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(100)
	search?: string;
}
