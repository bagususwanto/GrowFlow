import { Module } from '@nestjs/common';
import { DeliveryNotesService } from './delivery-notes.service';
import { DeliveryNotesController } from './delivery-notes.controller';
import { DeliveryNotesRepository } from './delivery-notes.repository';

@Module({
  controllers: [DeliveryNotesController],
  providers: [DeliveryNotesService, DeliveryNotesRepository],
  exports: [DeliveryNotesService, DeliveryNotesRepository],
})
export class DeliveryNotesModule {}
