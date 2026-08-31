import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { AttributesRepo } from './attributes.repository';

@Module({
  providers: [AttributesService, AttributesRepo],
  controllers: [AttributesController],
})
export class AttributesModule {}
