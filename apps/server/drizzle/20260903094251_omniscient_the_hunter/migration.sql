ALTER TABLE "budget_settings" ADD COLUMN "category" "attribute_type" DEFAULT 'Budget' NOT NULL;--> statement-breakpoint
ALTER TABLE "budget_settings" ALTER COLUMN "type" SET DATA TYPE varchar(50) USING "type"::varchar(50);--> statement-breakpoint
ALTER TABLE "budget_settings" ALTER COLUMN "type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "expense_transactions" ALTER COLUMN "type" DROP NOT NULL;