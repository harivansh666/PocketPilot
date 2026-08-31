CREATE TABLE "budget_settings" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"category" "attribute_type" NOT NULL,
	"amount" integer NOT NULL,
	"limit" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_transactions" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"category" "attribute_type" NOT NULL,
	"note" text,
	"last_balance" integer,
	"date" timestamp NOT NULL,
	"spent_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
