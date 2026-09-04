CREATE TABLE "ota_updates" (
	"id" serial PRIMARY KEY,
	"update_id" text NOT NULL UNIQUE,
	"runtime_version" text NOT NULL,
	"platform" text NOT NULL,
	"channel" text DEFAULT 'production' NOT NULL,
	"manifest" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
