import { Migration } from '@mikro-orm/migrations'

export class Migration20250121000000CreatePushNotificationTables extends Migration {
  override async up(): Promise<void> {
    // Create push_subscription table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "push_subscription" (
        "id" text NOT NULL,
        "user_id" text NULL,
        "endpoint" text NOT NULL,
        "keys" jsonb NOT NULL,
        "device_info" jsonb NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create indexes for push_subscription
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_push_subscription_user_id" 
      ON "push_subscription" ("user_id") 
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_push_subscription_endpoint" 
      ON "push_subscription" ("endpoint") 
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_push_subscription_deleted_at" 
      ON "push_subscription" ("deleted_at") 
      WHERE "deleted_at" IS NULL;
    `)

    // Create scheduled_notification table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "scheduled_notification" (
        "id" text NOT NULL,
        "title" text NOT NULL,
        "body" text NOT NULL,
        "icon" text NULL,
        "badge" text NULL,
        "image" text NULL,
        "data" jsonb NULL,
        "scheduled_at" timestamptz NULL,
        "sent_at" timestamptz NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "target_type" text NOT NULL,
        "target_user_ids" jsonb NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "scheduled_notification_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create indexes for scheduled_notification
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_scheduled_notification_status" 
      ON "scheduled_notification" ("status");
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_scheduled_notification_scheduled_at" 
      ON "scheduled_notification" ("scheduled_at") 
      WHERE "scheduled_at" IS NOT NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_scheduled_notification_target_type" 
      ON "scheduled_notification" ("target_type");
    `)

    // Create vapid_keys table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "vapid_keys" (
        "id" text NOT NULL,
        "public_key" text NOT NULL,
        "private_key" text NOT NULL,
        "subject" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "vapid_keys_pkey" PRIMARY KEY ("id")
      );
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "push_subscription" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "scheduled_notification" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "vapid_keys" CASCADE;`)
  }
}

