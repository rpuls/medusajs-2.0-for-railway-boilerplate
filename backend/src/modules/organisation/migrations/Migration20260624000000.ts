import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260624000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "organisation" (' +
        '"id" text not null, ' +
        '"handle" text not null, ' +
        '"name" text not null, ' +
        '"abn" text null, ' +
        '"contact_email" text null, ' +
        '"contact_phone" text null, ' +
        '"notes" text null, ' +
        '"default_pricing_tier" text null, ' +
        '"tax_exempt" boolean not null default false, ' +
        '"tax_exempt_reason" text null, ' +
        '"metadata" jsonb not null default \'{}\'::jsonb, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "organisation_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create unique index if not exists "IDX_organisation_handle" on "organisation" ("handle") where "deleted_at" is null;'
    )

    this.addSql(
      'create table if not exists "organisation_member" (' +
        '"id" text not null, ' +
        '"organisation_id" text not null, ' +
        '"customer_id" text not null, ' +
        '"role" text not null default \'purchaser\', ' +
        '"invited_by" text null, ' +
        '"accepted_at" timestamptz null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "organisation_member_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_organisation_member_org_id" on "organisation_member" ("organisation_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_organisation_member_customer_id" on "organisation_member" ("customer_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create unique index if not exists "IDX_organisation_member_unique" on "organisation_member" ("organisation_id", "customer_id") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "organisation_member" cascade;')
    this.addSql('drop table if exists "organisation" cascade;')
  }
}
