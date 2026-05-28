import { Module } from '@nestjs/common';
import { CategoryItemsService } from './category-items.service';
import { CategoryItemsController } from './category-items.controller';
import { CategoryItemsRepository } from './category-items.repository';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryItemsController],
  providers: [CategoryItemsService, CategoryItemsRepository],
  exports: [CategoryItemsService, CategoryItemsRepository],
})
export class CategoryItemsModule {}
