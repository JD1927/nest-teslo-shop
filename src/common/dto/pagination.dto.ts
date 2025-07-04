import { IsOptional, IsPositive, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Limit the number of results returned',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of results to skip (offset)',
    default: 0,
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Min(0)
  offset?: number;
}
