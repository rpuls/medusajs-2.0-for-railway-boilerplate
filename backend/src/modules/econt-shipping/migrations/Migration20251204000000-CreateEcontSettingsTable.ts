import { Migration } from '@mikro-orm/migrations'

export class Migration20251204000000CreateEcontSettingsTable extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "econt_settings" (
        "id" text NOT NULL,
        "username" text NOT NULL,
        "password" text NOT NULL,
        "live" boolean NOT NULL DEFAULT false,
        "sender_type" text NOT NULL DEFAULT 'OFFICE',
        "sender_city" text NOT NULL,
        "sender_post_code" text NOT NULL,
        "sender_office_code" text NULL,
        "sender_street" text NULL,
        "sender_street_num" text NULL,
        "sender_quarter" text NULL,
        "sender_building_num" text NULL,
        "sender_entrance_num" text NULL,
        "sender_floor_num" text NULL,
        "sender_apartment_num" text NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "econt_settings_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_econt_settings_deleted_at" 
      ON "econt_settings" ("deleted_at") 
      WHERE "deleted_at" IS NULL;
    `)
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "econt_settings" CASCADE;`)
  }
}

