import db from 'src/db';
import { desc, eq, sql, sum } from 'drizzle-orm';

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
      type: data.type,
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
        type: data.type,
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
  async getDashboardRecord() {
    const budgetRecords = await db
      .select()
      .from(BudgetSettings)
      .where(eq(BudgetSettings.userId, 1))
      .orderBy(desc(BudgetSettings.createdAt))
      .limit(1);

    const expenseTotals = await db
      .select({
        totalSpent: sum(ExpenseTransactions.amount),
      })
      .from(ExpenseTransactions)
      .where(eq(ExpenseTransactions.userId, 1));

    const totalSpent = Number(expenseTotals[0]?.totalSpent) || 0;
    const totalBudget = budgetRecords[0]?.amount || 0;
    const remaining = totalBudget - totalSpent;

    const categories = await db
      .select({
        category: ExpenseTransactions.category,
        type: ExpenseTransactions.type,
        budget: sql<number>`COALESCE(${BudgetSettings.amount}, 0)`,
        spent: sum(ExpenseTransactions.amount),
        remaning: sql<number>`COALESCE(${BudgetSettings.amount}, 0) - ${sum(ExpenseTransactions.amount)}`,
      })
      .from(ExpenseTransactions)
      .where(eq(ExpenseTransactions.userId, 1))
      .leftJoin(
        BudgetSettings,
        sql`${ExpenseTransactions.type} = ${BudgetSettings.type}::text`,
      )
      .groupBy(ExpenseTransactions.category, ExpenseTransactions.type, BudgetSettings.amount)
      .orderBy(desc(sum(ExpenseTransactions.amount)));

    return {
      expence: [{ totalBudget, totalSpent, remaining, remaning: remaining }],
      budget: budgetRecords[0] || null,
      categories,
    };
  }

  async getHistoryRecord() {
    const transactions = await db
      .select({
        id: ExpenseTransactions.id,
        amount: ExpenseTransactions.amount,
        type: ExpenseTransactions.type,
        category: ExpenseTransactions.category,
        date: ExpenseTransactions.date,
        lastBalance: ExpenseTransactions.lastBalance,
        note: ExpenseTransactions.note,
      })
      .from(ExpenseTransactions)
      .where(eq(ExpenseTransactions.userId, 1))
      .orderBy(desc(ExpenseTransactions.createdAt));

    const totalSpentResult = await db
      .select({
        monthlySpent: sum(ExpenseTransactions.amount),
      })
      .from(ExpenseTransactions)
      .where(eq(ExpenseTransactions.userId, 1));

    const monthlySpent = Number(totalSpentResult[0]?.monthlySpent) || 0;

    const history = transactions.map((item) => {
      const typeName = item.type || item.category || "personal";
      const amount = Number(item.amount) || 0;

      let targetLimit = 1000;
      if (amount >= 500 && amount <= 600) {
        targetLimit = 1000;
      } else if (amount < 500) {
        targetLimit = 500;
      } else {
        targetLimit = Math.ceil(amount / 500) * 500;
      }

      const lessThenLimit = `Keep ${typeName.toLowerCase()} spending under ₹${targetLimit.toLocaleString("en-IN")} this month`;

      return {
        ...item,
        monthlySpent,
        lessThenLimit,
      };
    });

    return history;
  }
}