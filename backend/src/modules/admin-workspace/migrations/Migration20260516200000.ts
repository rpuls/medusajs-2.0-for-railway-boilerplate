import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260516200000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "status_banner" (' +
        '"id" text not null, ' +
        '"body" text not null, ' +
        '"severity" text not null default \'info\', ' +
        '"expires_at" text null, ' +
        '"created_by" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "status_banner_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_status_banner_expires" on "status_banner" ("expires_at") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "status_banner" cascade;')
  }
}
