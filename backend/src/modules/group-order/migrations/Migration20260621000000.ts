import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260621000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "group_order" (' +
        '"id" text not null, ' +
        '"public_token" text not null, ' +
        '"status" text not null default \'open\', ' +
        '"title" text not null, ' +
        '"organisation_name" text null, ' +
        '"owner_customer_id" text null, ' +
        '"owner_email" text not null, ' +
        '"owner_name" text null, ' +
        '"base_product_id" text null, ' +
        '"base_variant_id" text null, ' +
        '"base_design_id" text null, ' +
        '"customizer_metadata" jsonb not null default \'{}\'::jsonb, ' +
        '"deadline_at" timestamptz null, ' +
        '"notes" text null, ' +
        '"converted_order_ids" jsonb not null default \'{}\'::jsonb, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "group_order_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create unique index if not exists "IDX_group_order_public_token" on "group_order" ("public_token") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_group_order_owner_customer_id" on "group_order" ("owner_customer_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_group_order_status" on "group_order" ("status") where "deleted_at" is null;'
    )

    this.addSql(
      'create table if not exists "group_order_participant" (' +
        '"id" text not null, ' +
        '"group_order_id" text not null, ' +
        '"name" text not null, ' +
        '"size_label" text not null, ' +
        '"quantity" integer not null default 1, ' +
        '"player_number" text null, ' +
        '"custom_notes" text null, ' +
        '"submitter_email" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "group_order_participant_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_group_order_participant_group_order_id" on "group_order_participant" ("group_order_id") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "group_order_participant" cascade;')
    this.addSql('drop table if exists "group_order" cascade;')
  }
}
