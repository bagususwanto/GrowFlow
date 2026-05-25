import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenEntity {
  @ApiProperty({ description: 'The unique ID of the refresh token', example: 'token-uuid' })
  id!: string;

  @ApiProperty({ description: 'Hashed representation of the refresh token string' })
  tokenHash!: string;

  @ApiProperty({ description: 'User ID associated with the token', example: 'user-uuid' })
  userId!: string;

  @ApiProperty({ description: 'Expiration date of the refresh token' })
  expiresAt!: Date;

  @ApiProperty({ description: 'Revocation date of the refresh token', required: false, nullable: true })
  revokedAt?: Date | null;

  @ApiProperty({ description: 'Creation date of the token record' })
  createdAt!: Date;
}
