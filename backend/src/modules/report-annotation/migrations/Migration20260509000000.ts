import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260509000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "report_annotation" (' +
        '"id" text not null, ' +
        '"date" text not null, ' +
        '"label" text not null, ' +
        '"description" text null, ' +
        '"color" text not null default \'slate\', ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "report_annotation_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_report_annotation_date" on "report_annotation" ("date") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_report_annotation_deleted_at" on "report_annotation" ("deleted_at") where "deleted_at" is not null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "report_annotation" cascade;')
  }
}
