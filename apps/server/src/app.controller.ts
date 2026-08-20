import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { ExpenseSchema } from '@expense-tracker/shared';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('expenses')
  createExpense(@Body() body: unknown) {
    const result = ExpenseSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }

    return result.data;
  }
}
