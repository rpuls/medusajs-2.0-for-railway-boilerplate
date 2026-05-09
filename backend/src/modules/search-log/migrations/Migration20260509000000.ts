import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260509000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "search_event" (' +
        '"id" text not null, ' +
        '"query" text not null, ' +
        '"query_normalized" text not null, ' +
        '"results_count" integer not null default 0, ' +
        '"country_code" text null, ' +
        '"customer_id" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "search_event_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_search_event_query_normalized" on "search_event" ("query_normalized") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_search_event_customer_id" on "search_event" ("customer_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_search_event_created_at" on "search_event" ("created_at") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_search_event_deleted_at" on "search_event" ("deleted_at") where "deleted_at" is not null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "search_event" cascade;')
  }
}
