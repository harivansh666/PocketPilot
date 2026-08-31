CREATE TYPE "attribute_type" AS ENUM('INCOME', 'PETROL', 'FOOD', 'VEGETABLES', 'OTHERS');--> statement-breakpoint
CREATE TABLE "attributes" (
	"uuid" uuid PRIMARY KEY,
	"name" varchar NOT NULL,
	"type" "attribute_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
