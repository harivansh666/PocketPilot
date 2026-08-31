import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
export class CreateExpenseDto {
  @IsNumber()
  userId!: number;

  @IsNumber()
  amount!: number;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  lastBalance?: number;

  @IsDateString()
  date!: string;

  @IsDateString()
  spentAt!: string;
}
