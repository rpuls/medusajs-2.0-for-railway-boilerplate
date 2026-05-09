import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260516200000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "automation_rule" (' +
        '"id" text not null, ' +
        '"name" text not null, ' +
        '"trigger_event" text not null, ' +
        '"conditions" jsonb null, ' +
        '"actions" jsonb not null, ' +
        '"enabled" boolean not null default true, ' +
        '"last_fired_at" text null, ' +
        '"fire_count" integer not null default 0, ' +
        '"created_by" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "automation_rule_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_automation_rule_trigger" on "automation_rule" ("trigger_event") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_automation_rule_enabled" on "automation_rule" ("enabled") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "automation_rule" cascade;')
  }
}
