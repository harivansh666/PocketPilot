import { Injectable } from '@nestjs/common';
import { AttributesRepo } from './attributes.repo';

@Injectable()
export class AttributesService {
  constructor(private readonly attributesRepo: AttributesRepo) {}

  create() {
    // Implement the logic to create an attribute here
    // For now return the received body for verification
    return { id: 1, name: 'Sample Attribute' };
  }
  findAll() {
    this.attributesRepo.findAll();
  }
}
