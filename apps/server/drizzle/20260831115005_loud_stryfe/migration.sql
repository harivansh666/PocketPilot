ALTER TABLE "budget_settings" ADD COLUMN "type" "attribute_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "budget_settings" DROP COLUMN "category";