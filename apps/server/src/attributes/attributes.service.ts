import { Injectable } from '@nestjs/common';
import { AttributesRepo } from './attributes.repo';
import { AttributeInsert } from './Attribute.schema';

@Injectable()
export class AttributesService {
  constructor(private readonly attributesRepo: AttributesRepo) {}

  create(data: AttributeInsert) {
    this.attributesRepo.create(data);
    return { id: 1, name: 'Sample Attribute' };
  }
  async findAll(): Promise<{ id: string; name: string }[]> {
    return await this.attributesRepo.findAll();
  }
}
