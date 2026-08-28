import { Controller, Get } from '@nestjs/common';
import { AttributesService } from './attributes.service';

@Controller('attributes')
export class AttributesController {
    constructor(private readonly attributesService: AttributesService) { }
    @Get('create')
    async create() {
        return this.attributesService.create();
    }
}
