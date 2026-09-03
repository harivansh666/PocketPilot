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
  async getBudget(month?: string) {
    return await this.expenseRepo.getBudgetRecord(1, month);
  }
  async getExpenses() {
    return await this.expenseRepo.getExpenseRecords();
  }
  async getDashboard(month?: string) {
    return await this.expenseRepo.getDashboardRecord(1, month);
  }
  async getHistory(month?: string) {
    return await this.expenseRepo.getHistoryRecord(month);
  }
}
