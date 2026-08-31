import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

const AttrubuteType = pgEnum('attribute_type', ['Expense', 'Budget']);

const Attribute = pgTable('attributes', {
  id: uuid('uuid').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  type: AttrubuteType('type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export { Attribute, AttrubuteType };

export type AttributeInsert = InferInsertModel<typeof Attribute>;
export type AttributeType = InferSelectModel<typeof Attribute>;

// InferSelectModel — jab DB se DATA NIKAAL rahe ho
// InferInsertModel — jab DB se DATA INSERT KAR rahe ho
