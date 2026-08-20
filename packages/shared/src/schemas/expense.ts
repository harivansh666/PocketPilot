// packages/shared/src/schemas/expense.ts
import { z } from "zod";

export const ExpenseSchema = z.object({
  title: z.string().min(2),
  amount: z.number().positive(),
  category: z.enum(["PETROL", "VEGETABLES", "FOOD"]),
});

export type Expense = z.infer<typeof ExpenseSchema>;
