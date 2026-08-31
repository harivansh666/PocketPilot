import db from 'src/db';
import { Attribute, AttributeInsert } from './Attribute.schema';

export class AttributesRepo {
  async create(data: AttributeInsert) {
    await db
      .insert(Attribute)
      .values({ name: data.name, type: data.type })
      .returning({ id: Attribute.id, name: Attribute.name });
  }
  async findAll(): Promise<{ id: string; name: string }[]> {
    return await db
      .select({ id: Attribute.id, name: Attribute.name })
      .from(Attribute);
  }
}
