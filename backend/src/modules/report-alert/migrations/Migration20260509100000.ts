import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260509100000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "report_alert" (' +
        '"id" text not null, ' +
        '"name" text not null, ' +
        '"metric" text not null, ' +
        '"comparator" text not null, ' +
        '"threshold" numeric not null, ' +
        '"recipient_email" text not null, ' +
        '"cooldown_days" integer not null default 7, ' +
        '"enabled" boolean not null default true, ' +
        '"last_fired_at" text null, ' +
        '"last_value" numeric null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "report_alert_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_report_alert_enabled" on "report_alert" ("enabled") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_report_alert_deleted_at" on "report_alert" ("deleted_at") where "deleted_at" is not null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "report_alert" cascade;')
  }
}
