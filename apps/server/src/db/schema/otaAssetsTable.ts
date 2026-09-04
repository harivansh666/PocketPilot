import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const otaAssetsTable = pgTable('ota_assets', {
  id: serial('id').primaryKey(),
  assetPath: text('asset_path').notNull().unique(),
  contentBase64: text('content_base64').notNull(),
  contentType: text('content_type'),
  createdAt: timestamp('created_at').defaultNow(),
});
