import { Type } from 'class-transformer';
import { IsDate, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { type CreateExpenseTransaction } from '../expense.schema';

type ExpenseCategory = CreateExpenseTransaction['category'];

export class CreateExpenseDto {
  @IsNumber()
  userId!: number;

  @IsNumber()
  amount!: number;

  @IsIn(['Expense', 'Budget'])
  category!: ExpenseCategory;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  lastBalance?: number;

  @Type(() => Date)
  @IsDate()
  date!: Date;

  @Type(() => Date)
  @IsDate()
  spentAt!: Date;
}
