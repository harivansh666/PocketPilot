import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response.message.decorators';
import { type CreateBudgetSettings } from './expense.schema';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}
  @Post('add')
  @ResponseMessage('Expense added successfully')
  addExpense(@Body() data: CreateExpenseDto) {
    return this.expenseService.addExpense(data);
  }

  @Patch('update/:id')
  @ResponseMessage('Expense updated successfully')
  updateExpense(
    @Body() data: CreateExpenseDto,
    @Param('id', ParseIntPipe) id: string,
  ) {
    return this.expenseService.updateExpense(data, id);
  }

  @Post('add-budget')
  @ResponseMessage('Budget added successfully')
  addBudget(@Body() data: CreateBudgetSettings) {
    return this.expenseService.addBudget(data);
  }
}
