import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PartnersRepository } from './partners.repository';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ListPartnersQueryDto } from './dto/list-partners-query.dto';
import { PaginatedResponse } from '@growflow/types';
import { PartnerResponseEntity } from './entities/partner-response.entity';
import { Partner } from '@prisma/client';

@Injectable()
export class PartnersService {
  constructor(private readonly partnersRepository: PartnersRepository) {}

  private mapToResponse(partner: Partner): PartnerResponseEntity {
    return {
      id: partner.id,
      code: partner.code,
      name: partner.name,
      type: partner.type,
      email: partner.email,
      phone: partner.phone,
      address: partner.address,
      isActive: partner.isActive,
      paymentTermsDays: partner.paymentTermsDays,
      createdAt: partner.createdAt.toISOString(),
      updatedAt: partner.updatedAt.toISOString(),
    };
  }

  async findAll(query: ListPartnersQueryDto): Promise<PaginatedResponse<PartnerResponseEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [partners, total] = await this.partnersRepository.findAll(query, skip, limit);

    return {
      data: partners.map(p => this.mapToResponse(p)),
      total,
      page,
      limit,
    };
  }


  async findOne(id: string): Promise<PartnerResponseEntity> {
    const partner = await this.partnersRepository.findById(id);
    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }
    return this.mapToResponse(partner);
  }

  private async generateCode(type: string): Promise<string> {
    const prefix = type === 'SUPPLIER' ? 'SUP-' : 'CUS-';
    const lastPartner = await this.partnersRepository.findLastByCodePrefix(prefix);
    if (!lastPartner) {
      return `${prefix}0001`;
    }

    const numericPartStr = lastPartner.code.substring(prefix.length);
    const numericPart = parseInt(numericPartStr, 10);
    if (isNaN(numericPart)) {
      return `${prefix}0001`;
    }

    const nextNumber = numericPart + 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');
    return `${prefix}${paddedNumber}`;
  }

  async create(dto: CreatePartnerDto): Promise<PartnerResponseEntity> {
    let code = dto.code;
    if (!code) {
      code = await this.generateCode(dto.type);
    }

    const existing = await this.partnersRepository.findByCode(code);
    if (existing) {
      throw new ConflictException(`Partner with code ${code} already exists`);
    }

    const partner = await this.partnersRepository.create({ ...dto, code });
    return this.mapToResponse(partner);
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<PartnerResponseEntity> {
    const partner = await this.partnersRepository.findById(id);
    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    if (dto.code && dto.code !== partner.code) {
      const existing = await this.partnersRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Partner with code ${dto.code} already exists`);
      }
    }

    const updated = await this.partnersRepository.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const partner = await this.partnersRepository.findById(id);
    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }
    await this.partnersRepository.softDelete(id);
  }
}
