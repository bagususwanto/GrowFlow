import { PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';
import { UpdateItemRequest } from '@growflow/types';

export class UpdateItemDto extends PartialType(CreateItemDto) implements UpdateItemRequest {}
