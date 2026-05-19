import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * CRM Phase 9b — Resend webhook event idempotency table.
 *
 * One row per Svix event_id we've processed. Insert short-circuits
 * retries on the unique PK.
 */
export class Migration20270401000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "resend_event" (' +
        '"id" text not null, ' +
        '"event_type" text not null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "resend_event_pkey" primary key ("id")' +
        ');'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "resend_event" cascade;')
  }
}
