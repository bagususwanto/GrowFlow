import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Partner, Prisma } from '@prisma/client';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PartnerWhereInput;
  }): Promise<[Partner[], number]> {
    const [data, total] = await Promise.all([
      this.prisma.partner.findMany({
        skip: params.skip,
        take: params.take,
        where: params.where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partner.count({ where: params.where }),
    ]);
    return [data, total];
  }

  async findById(id: string): Promise<Partner | null> {
    return this.prisma.partner.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findByCode(code: string): Promise<Partner | null> {
    return this.prisma.partner.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async create(data: CreatePartnerDto): Promise<Partner> {
    return this.prisma.partner.create({
      data,
    });
  }

  async update(id: string, data: UpdatePartnerDto): Promise<Partner> {
    return this.prisma.partner.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Partner> {
    return this.prisma.partner.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
