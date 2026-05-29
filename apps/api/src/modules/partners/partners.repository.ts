import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Partner, Prisma } from '@prisma/client';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ListPartnersQueryDto } from './dto/list-partners-query.dto';


@Injectable()
export class PartnersRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(query: ListPartnersQueryDto): Prisma.PartnerWhereInput {
    const where: Prisma.PartnerWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return where;
  }

  async findAll(
    query: ListPartnersQueryDto,
    skip?: number,
    take?: number,
  ): Promise<[Partner[], number]> {
    const where = this.buildWhereClause(query);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      this.prisma.partner.findMany({
        skip,
        take,
        where,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.partner.count({ where }),
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

  async findLastByCodePrefix(prefix: string): Promise<Partner | null> {
    return this.prisma.partner.findFirst({
      where: {
        code: {
          startsWith: prefix,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
      orderBy: {
        code: 'desc',
      },
    });
  }

  async create(data: CreatePartnerDto & { code: string }): Promise<Partner> {
    return this.prisma.partner.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
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
