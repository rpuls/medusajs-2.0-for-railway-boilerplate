import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260618000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "quote" (' +
        '"id" text not null, ' +
        '"public_id" text not null, ' +
        '"status" text not null default \'new\', ' +
        '"source" text not null default \'byo\', ' +
        '"customer_id" text null, ' +
        '"email" text not null, ' +
        '"contact_name" text null, ' +
        '"contact_phone" text null, ' +
        '"company" text null, ' +
        '"subject" text null, ' +
        '"message" text null, ' +
        '"assigned_to" text null, ' +
        '"currency_code" text not null default \'aud\', ' +
        '"total_estimate" numeric null, ' +
        '"line_items" jsonb not null default \'{}\'::jsonb, ' +
        '"metadata" jsonb not null default \'{}\'::jsonb, ' +
        '"expires_at" timestamptz null, ' +
        '"quoted_at" timestamptz null, ' +
        '"accepted_at" timestamptz null, ' +
        '"lost_at" timestamptz null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "quote_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_quote_status" on "quote" ("status") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_quote_customer_id" on "quote" ("customer_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_quote_assigned_to" on "quote" ("assigned_to") where "deleted_at" is null;'
    )
    this.addSql(
      'create unique index if not exists "IDX_quote_public_id" on "quote" ("public_id") where "deleted_at" is null;'
    )

    this.addSql(
      'create table if not exists "quote_event" (' +
        '"id" text not null, ' +
        '"quote_id" text not null, ' +
        '"type" text not null, ' +
        '"actor" text null, ' +
        '"body" jsonb not null default \'{}\'::jsonb, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "quote_event_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_quote_event_quote_id" on "quote_event" ("quote_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_quote_event_type" on "quote_event" ("type") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "quote_event" cascade;')
    this.addSql('drop table if exists "quote" cascade;')
  }
}
