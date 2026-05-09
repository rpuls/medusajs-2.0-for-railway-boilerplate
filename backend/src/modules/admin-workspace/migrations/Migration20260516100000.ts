import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260516100000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "admin_presence" (' +
        '"id" text not null, ' +
        '"user_id" text not null, ' +
        '"user_email" text null, ' +
        '"entity" text not null, ' +
        '"entity_id" text not null, ' +
        '"last_heartbeat_at" text not null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "admin_presence_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_admin_presence_entity" on "admin_presence" ("entity", "entity_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_admin_presence_user" on "admin_presence" ("user_id") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "admin_presence" cascade;')
  }
}
