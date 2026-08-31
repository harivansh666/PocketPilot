import { Injectable } from '@nestjs/common';
import { type CreateExpenseTransaction } from './expense.schema';
import { ExpenseRepository } from './expense.repository';

@Injectable()
export class ExpenseService {
  constructor(private readonly expenseRepo: ExpenseRepository) {}
  async addExpense(data: Omit<CreateExpenseTransaction, 'lastBalance'>) {
    return await this.expenseRepo.addExpenseRecord(data);
  }
}
