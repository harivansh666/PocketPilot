import db from 'src/db';
import { eq } from 'drizzle-orm';

import {
  BudgetSettings,
  type CreateBudgetSettings,
  ExpenseTransactions,
} from './expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';

export class ExpenseRepository {
  async addExpenseRecord(data: CreateExpenseDto) {
    await db.insert(ExpenseTransactions).values({
      amount: data.amount,
      category: data.category,
      date: data.date,
      userId: data.userId,
      lastBalance: data.lastBalance,
      note: data.note,
      spentAt: data.spentAt,
    });
  }
  async updateExpenseRecord(data: CreateExpenseDto, id: string) {
    await db
      .update(ExpenseTransactions)
      .set({
        amount: data.amount,
        category: data.category,
        date: data.date,
        userId: data.userId,
        lastBalance: data.lastBalance,
        note: data.note,
        spentAt: data.spentAt,
      })
      .where(eq(ExpenseTransactions.id, id));
  }
  async addBudgetRecord(data: CreateBudgetSettings) {
    await db.insert(BudgetSettings).values(data);
  }
}
