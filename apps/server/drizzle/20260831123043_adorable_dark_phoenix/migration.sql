ALTER TABLE "attributes" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "budget_settings" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "expense_transactions" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE IF EXISTS "attribute_type";--> statement-breakpoint
CREATE TYPE "attribute_type" AS ENUM('Expense', 'Budget');--> statement-breakpoint
ALTER TABLE "attributes" ALTER COLUMN "type" SET DATA TYPE "attribute_type" USING (CASE WHEN "type" IN ('Expense', 'Budget') THEN "type" ELSE 'Expense' END)::"attribute_type";--> statement-breakpoint
ALTER TABLE "budget_settings" ALTER COLUMN "type" SET DATA TYPE "attribute_type" USING (CASE WHEN "type" IN ('Expense', 'Budget') THEN "type" ELSE 'Expense' END)::"attribute_type";--> statement-breakpoint
ALTER TABLE "expense_transactions" ALTER COLUMN "category" SET DATA TYPE "attribute_type" USING (CASE WHEN "category" IN ('Expense', 'Budget') THEN "category" ELSE 'Expense' END)::"attribute_type";--> statement-breakpoint
ALTER TABLE "attributes" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid();