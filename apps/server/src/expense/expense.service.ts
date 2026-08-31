import { Injectable } from '@nestjs/common';
import { type CreateBudgetSettings } from './expense.schema';
import { ExpenseRepository } from './expense.repository';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private readonly expenseRepo: ExpenseRepository) {}
  async addExpense(data: CreateExpenseDto) {
    return await this.expenseRepo.addExpenseRecord(data);
  }
  async updateExpense(data: CreateExpenseDto, id: string) {
    return await this.expenseRepo.updateExpenseRecord(data, id);
  }
  async addBudget(data: CreateBudgetSettings) {
    return await this.expenseRepo.addBudgetRecord(data);
  }
}
