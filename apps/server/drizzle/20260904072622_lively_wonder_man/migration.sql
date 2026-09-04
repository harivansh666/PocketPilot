CREATE TABLE "ota_assets" (
	"id" serial PRIMARY KEY,
	"asset_path" text NOT NULL UNIQUE,
	"content_base64" text NOT NULL,
	"content_type" text,
	"created_at" timestamp DEFAULT now()
);
