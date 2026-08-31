import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response.message.decorators';
import { type CreateExpenseTransaction } from './expense.schema';
import { ExpenseService } from './expense.service';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}
  @Post('add')
  @ResponseMessage('Expense added successfully')
  addExpense(@Body() data: Omit<CreateExpenseTransaction, 'lastBalance'>) {
    return this.expenseService.addExpense(data);
  }
}
