import db from 'src/db';
import { eq } from 'drizzle-orm';

import {
  type CreateExpenseTransaction,
  ExpenseTransactions,
} from './expense.schema';

export class ExpenseRepository {
  async addExpenseRecord(data: CreateExpenseTransaction) {
    await db.insert(ExpenseTransactions).values(data);
  }
  async updateExpenseRecord(data: CreateExpenseTransaction, id: string) {
    await db
      .update(ExpenseTransactions)
      .set(data)
      .where(eq(ExpenseTransactions.id, id));
  }
}
