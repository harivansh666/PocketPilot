import { Body, Controller, Get, Post } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { ResponseMessage } from '../common/decorators/response.message.decorators';
import { type AttributeInsert } from './Attribute.schema';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}
  @Post('create')
  @ResponseMessage('Attribute created successfully generated')
  create(@Body() data: AttributeInsert) {
    return this.attributesService.create(data);
  }

  @Get('all')
  @ResponseMessage('Attributes fetched successfully')
  async findAll() {
    return await this.attributesService.findAll();
  }
}
