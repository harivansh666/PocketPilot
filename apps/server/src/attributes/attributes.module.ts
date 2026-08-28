import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';

@Module({
  providers: [AttributesService],
  controllers: [AttributesController]
})
export class AttributesModule { }
