import { pgTable, serial, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const otaUpdatesTable = pgTable('ota_updates', {
  id: serial('id').primaryKey(),
  updateId: text('update_id').notNull().unique(),
  runtimeVersion: text('runtime_version').notNull(),
  platform: text('platform').notNull(),
  channel: text('channel').notNull().default('production'),
  manifest: jsonb('manifest').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
