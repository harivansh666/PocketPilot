ALTER TABLE "attributes" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "budget_settings" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "expense_transactions" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE IF EXISTS "attribute_type";--> statement-breakpoint
CREATE TYPE "attribute_type" AS ENUM('Expense', 'Bugdet');--> statement-breakpoint
ALTER TABLE "attributes" ALTER COLUMN "type" SET DATA TYPE "attribute_type" USING (CASE WHEN "type" IN ('Expense', 'Bugdet') THEN "type" ELSE 'Expense' END)::"attribute_type";--> statement-breakpoint
ALTER TABLE "budget_settings" ALTER COLUMN "type" SET DATA TYPE "attribute_type" USING (CASE WHEN "type" IN ('Expense', 'Bugdet') THEN "type" ELSE 'Expense' END)::"attribute_type";--> statement-breakpoint
ALTER TABLE "expense_transactions" ALTER COLUMN "category" SET DATA TYPE "attribute_type" USING (CASE WHEN "category" IN ('Expense', 'Bugdet') THEN "category" ELSE 'Expense' END)::"attribute_type";