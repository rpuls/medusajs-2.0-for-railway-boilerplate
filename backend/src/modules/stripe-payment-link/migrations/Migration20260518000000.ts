import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260518000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "stripe_payment_link" (' +
        '"id" text not null, ' +
        '"stripe_link_id" text not null, ' +
        '"stripe_payment_intent_id" text null, ' +
        '"url" text not null, ' +
        '"order_id" text null, ' +
        '"quote_id" text null, ' +
        '"amount" numeric not null, ' +
        '"raw_amount" jsonb not null, ' +
        '"currency_code" text not null, ' +
        "\"scenario\" text check (\"scenario\" in ('deposit', 'balance', 'quote', 'manual', 'full')) not null, " +
        '"label" text null, ' +
        "\"status\" text check (\"status\" in ('open', 'paid', 'deactivated', 'expired')) not null default 'open', " +
        '"paid_at" timestamptz null, ' +
        '"payment_collection_id" text null, ' +
        '"created_by_user_id" text null, ' +
        '"metadata" jsonb null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "stripe_payment_link_pkey" primary key ("id")' +
        ");"
    )
    this.addSql(
      'create unique index if not exists "IDX_stripe_payment_link_stripe_link_id_unique" on "stripe_payment_link" ("stripe_link_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_stripe_payment_link_order_id" on "stripe_payment_link" ("order_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_stripe_payment_link_quote_id" on "stripe_payment_link" ("quote_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_stripe_payment_link_status" on "stripe_payment_link" ("status") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_stripe_payment_link_deleted_at" on "stripe_payment_link" ("deleted_at") where "deleted_at" is not null;'
    )

    this.addSql(
      'create table if not exists "stripe_payment_link_event" (' +
        '"id" text not null, ' +
        '"event_type" text not null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "stripe_payment_link_event_pkey" primary key ("id")' +
        ");"
    )
    this.addSql(
      'create index if not exists "IDX_stripe_payment_link_event_deleted_at" on "stripe_payment_link_event" ("deleted_at") where "deleted_at" is not null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "stripe_payment_link_event" cascade;')
    this.addSql('drop table if exists "stripe_payment_link" cascade;')
  }
}
