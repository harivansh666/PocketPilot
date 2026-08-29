import { Controller, Get } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { ResponseMessage } from 'src/common/decorators/response.message.decorators';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}
  @Get('create')
  @ResponseMessage('Attribute created successfully generated')
  create() {
    return this.attributesService.create();
  }

  @Get('all')
  @ResponseMessage('Attributes fetched successfully')
  findAll() {
    return this.attributesService.findAll();
  }
}
