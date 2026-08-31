import db from 'src/db';
import { type CreateExpenseTransaction, ExpenseTransactions } from './expense.schema';

export class ExpenseRepository {
  async addExpenseRecord(data: CreateExpenseTransaction) {
    await db.insert(ExpenseTransactions).values(data);
  }
}
