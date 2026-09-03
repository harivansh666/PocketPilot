import { InferInsertModel } from 'drizzle-orm';
import { integer, text, timestamp } from 'drizzle-orm/pg-core';
import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { AttrubuteType } from '../attributes/Attribute.schema';

export const BudgetSettings = pgTable('budget_settings', {
  id: uuid('uuid').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  category: AttrubuteType('category').notNull(),
  type: varchar('type', { length: 50 }),
  amount: integer('amount').notNull(),
  limit: integer('limit').notNull(),
  month: varchar('month', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ExpenseTransactions = pgTable('expense_transactions', {
  id: uuid('uuid').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  amount: integer('amount').notNull(),
  category: AttrubuteType('category').notNull(),
  type: varchar('type', { length: 50 }),
  note: text('note'),
  lastBalance: integer('last_balance'),
  date: timestamp('date').notNull(),
  spentAt: timestamp('spent_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type CreateExpenseTransaction = InferInsertModel<
  typeof ExpenseTransactions
>;

export type CreateBudgetSettings = InferInsertModel<typeof BudgetSettings>;
