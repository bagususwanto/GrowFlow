import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Role, User, RefreshToken, Prisma } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<(User & { role: Role }) | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findUserById(id: string): Promise<(User & { role: Role }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async saveRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<RefreshToken> {
    const prisma = tx || this.prisma;
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  async revokeRefreshToken(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<RefreshToken> {
    const prisma = tx || this.prisma;
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<(User & { role: Role })> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }
}

