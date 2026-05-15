import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260622000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "customer_note" add column if not exists "snooze_until" timestamptz null;'
    )
    this.addSql(
      'create index if not exists "IDX_customer_note_snooze_until" on "customer_note" ("snooze_until") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop index if exists "IDX_customer_note_snooze_until";')
    this.addSql(
      'alter table "customer_note" drop column if exists "snooze_until";'
    )
  }
}
