import db from '../db';
import { and, desc, eq, ne, sql, sum } from 'drizzle-orm';

import {
  BudgetSettings,
  type CreateBudgetSettings,
  ExpenseTransactions,
} from './expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';

function getCurrentMonthString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export class ExpenseRepository {
  async addExpenseRecord(data: CreateExpenseDto) {
    const [lastBalanceRow] = await db
      .select({ lastBalance: ExpenseTransactions.lastBalance })
      .from(ExpenseTransactions)
      .where(
        and(
          eq(ExpenseTransactions.userId, data.userId),
          eq(ExpenseTransactions.category, data.category),
        ),
      )
      .orderBy(desc(ExpenseTransactions.createdAt))
      .limit(1);

    const lastBalance = data.lastBalance ?? lastBalanceRow?.lastBalance ?? 0;

    const [createdExpense] = await db
      .insert(ExpenseTransactions)
      .values({
        amount: data.amount,
        category: data.category,
        type: data.type,
        date: data.date,
        userId: data.userId,
        lastBalance,
        note: data.note,
        spentAt: data.spentAt,
      })
      .returning();

    return createdExpense;
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
  async addBudgetRecord(
    data: CreateBudgetSettings & {
      categories?: Array<{ type: string; amount: number }>;
      month?: string | null;
    },
  ) {
    const categories = data.categories ?? [];
    const month = data.month || getCurrentMonthString();

    await db.transaction(async (tx) => {
      await tx
        .delete(BudgetSettings)
        .where(
          and(
            eq(BudgetSettings.userId, data.userId),
            eq(BudgetSettings.category, 'Budget'),
            eq(BudgetSettings.month, month),
          ),
        );

      await tx.insert(BudgetSettings).values({
        userId: data.userId,
        category: 'Budget',
        type: 'Budget',
        amount: data.amount,
        limit: data.limit,
        month,
      });

      if (categories.length > 0) {
        await tx.insert(BudgetSettings).values(
          categories.map((category) => ({
            userId: data.userId,
            category: 'Budget' as const,
            type: category.type,
            amount: category.amount,
            limit: category.amount,
            month,
          })),
        );
      }
    });
  }
  async getBudgetRecord(userId: number = 1, month?: string) {
    const targetMonth = month || getCurrentMonthString();
    return await db
      .select({
        type: BudgetSettings.type,
        amount: BudgetSettings.amount,
        month: BudgetSettings.month,
      })
      .from(BudgetSettings)
      .where(
        and(
          eq(BudgetSettings.userId, userId),
          eq(BudgetSettings.category, 'Budget'),
          eq(BudgetSettings.month, targetMonth),
        ),
      )
      .orderBy(desc(BudgetSettings.createdAt));
  }
  async getExpenseRecords() {
    return await db
      .select()
      .from(ExpenseTransactions)
      .where(eq(ExpenseTransactions.userId, 1))
      .orderBy(desc(ExpenseTransactions.createdAt));
  }
  async getDashboardRecord(userId: number = 1, month?: string) {
    const targetMonth = month || getCurrentMonthString();

    const budgetRecords = await db
      .select()
      .from(BudgetSettings)
      .where(
        and(
          eq(BudgetSettings.userId, userId),
          eq(BudgetSettings.type, 'Budget'),
          eq(BudgetSettings.month, targetMonth),
        ),
      )
      .orderBy(desc(BudgetSettings.createdAt))
      .limit(1);

    const expenseTotals = await db
      .select({
        totalSpent: sum(ExpenseTransactions.amount),
      })
      .from(ExpenseTransactions)
      .where(
        and(
          eq(ExpenseTransactions.userId, userId),
          sql`to_char(${ExpenseTransactions.date}, 'YYYY-MM') = ${targetMonth}`,
        ),
      );

    const totalSpent = Number(expenseTotals[0]?.totalSpent) || 0;
    const totalBudget = budgetRecords[0]?.amount || 0;
    const remaining = totalBudget - totalSpent;

    const categories = await db
      .select({
        category: BudgetSettings.type,
        type: BudgetSettings.type,
        budget: sql<number>`COALESCE(${BudgetSettings.amount}, 0)`,
        spent: sum(ExpenseTransactions.amount),
        remaning: sql<number>`COALESCE(${BudgetSettings.amount}, 0) - ${sum(ExpenseTransactions.amount)}`,
      })
      .from(BudgetSettings)
      .leftJoin(
        ExpenseTransactions,
        and(
          eq(ExpenseTransactions.userId, BudgetSettings.userId),
          eq(ExpenseTransactions.type, BudgetSettings.type),
          sql`to_char(${ExpenseTransactions.date}, 'YYYY-MM') = ${targetMonth}`,
        ),
      )
      .where(
        and(
          eq(BudgetSettings.userId, userId),
          eq(BudgetSettings.category, 'Budget'),
          ne(BudgetSettings.type, 'Budget'),
          eq(BudgetSettings.month, targetMonth),
        ),
      )
      .groupBy(BudgetSettings.type, BudgetSettings.amount)
      .orderBy(desc(BudgetSettings.amount));

    return {
      expence: [{ totalBudget, totalSpent, remaining, remaning: remaining }],
      budget: budgetRecords[0] || null,
      categories,
    };
  }

  async getHistoryRecord(month?: string) {
    const targetMonth = month || getCurrentMonthString();
    const monthFilter = sql`to_char(${ExpenseTransactions.date}, 'YYYY-MM') = ${targetMonth}`;
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
      .where(and(eq(ExpenseTransactions.userId, 1), monthFilter))
      .orderBy(desc(ExpenseTransactions.createdAt));

    const totalSpentResult = await db
      .select({
        monthlySpent: sum(ExpenseTransactions.amount),
      })
      .from(ExpenseTransactions)
      .where(and(eq(ExpenseTransactions.userId, 1), monthFilter));

    const monthlySpent = Number(totalSpentResult[0]?.monthlySpent) || 0;

    const history = transactions.map((item) => {
      const typeName = item.type || item.category || 'personal';
      const amount = Number(item.amount) || 0;

      let targetLimit = 1000;
      if (amount >= 500 && amount <= 600) {
        targetLimit = 1000;
      } else if (amount < 500) {
        targetLimit = 500;
      } else {
        targetLimit = Math.ceil(amount / 500) * 500;
      }

      const lessThenLimit = `Keep ${typeName.toLowerCase()} spending under ₹${targetLimit.toLocaleString('en-IN')} this month`;

      return {
        ...item,
        monthlySpent,
        lessThenLimit,
      };
    });

    return history;
  }
}
