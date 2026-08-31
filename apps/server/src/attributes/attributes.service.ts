import { Injectable } from '@nestjs/common';
import { AttributesRepo } from './attributes.repository';
import { AttributeInsert } from './Attribute.schema';

@Injectable()
export class AttributesService {
  constructor(private readonly attributesRepo: AttributesRepo) {}

  async create(data: AttributeInsert) {
    return await this.attributesRepo.create(data);
  }
  async findAll(): Promise<{ id: string; name: string }[]> {
    return await this.attributesRepo.findAll();
  }
}
