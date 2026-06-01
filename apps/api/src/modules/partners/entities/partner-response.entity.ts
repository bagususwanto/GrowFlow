import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Partner, PartnerType } from '@growflow/types';

export class PartnerResponseEntity implements Partner {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['SUPPLIER', 'CUSTOMER'] })
  type!: PartnerType;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  address!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional({ nullable: true })
  paymentTermsDays?: number | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
