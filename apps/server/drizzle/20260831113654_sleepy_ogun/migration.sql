ALTER TABLE "attributes" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "attribute_type";--> statement-breakpoint
CREATE TYPE "attribute_type" AS ENUM('Income', 'Petrol', 'Food', 'Vegitables', 'Others');--> statement-breakpoint
ALTER TABLE "attributes" ALTER COLUMN "type" SET DATA TYPE "attribute_type" USING "type"::"attribute_type";