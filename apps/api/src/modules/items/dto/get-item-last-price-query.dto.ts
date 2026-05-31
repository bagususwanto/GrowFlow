import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class GetItemLastPriceQueryDto {
  @ApiProperty({ enum: ['purchase', 'sales'] })
  @IsIn(['purchase', 'sales'])
  type!: 'purchase' | 'sales';
}
