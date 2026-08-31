import { InferInsertModel } from 'drizzle-orm';
import { integer, text, timestamp } from 'drizzle-orm/pg-core';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { AttrubuteType } from 'src/attributes/Attribute.schema';

export const BudgetSettings = pgTable('budget_settings', {
  id: uuid('uuid').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  type: AttrubuteType('category').notNull(),
  amount: integer('amount').notNull(),
  limit: integer('limit').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ExpenseTransactions = pgTable('expense_transactions', {
  id: uuid('uuid').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  amount: integer('amount').notNull(),
  category: AttrubuteType('category').notNull(),
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
