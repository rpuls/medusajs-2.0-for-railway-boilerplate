import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260516000000 extends Migration {
  async up(): Promise<void> {
    // ---- customer_tag ----
    this.addSql(
      'create table if not exists "customer_tag" (' +
        '"id" text not null, ' +
        '"customer_id" text not null, ' +
        '"label" text not null, ' +
        '"color" text not null default \'slate\', ' +
        '"created_by" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "customer_tag_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_customer_tag_customer_id" on "customer_tag" ("customer_id") where "deleted_at" is null;'
    )

    // ---- customer_note ----
    this.addSql(
      'create table if not exists "customer_note" (' +
        '"id" text not null, ' +
        '"customer_id" text not null, ' +
        '"body" text not null, ' +
        '"pinned" boolean not null default false, ' +
        '"created_by" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "customer_note_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_customer_note_customer_id" on "customer_note" ("customer_id") where "deleted_at" is null;'
    )

    // ---- order_comment ----
    this.addSql(
      'create table if not exists "order_comment" (' +
        '"id" text not null, ' +
        '"order_id" text not null, ' +
        '"body" text not null, ' +
        '"created_by" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "order_comment_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_order_comment_order_id" on "order_comment" ("order_id") where "deleted_at" is null;'
    )

    // ---- audit_log ----
    this.addSql(
      'create table if not exists "audit_log" (' +
        '"id" text not null, ' +
        '"entity" text not null, ' +
        '"entity_id" text not null, ' +
        '"action" text not null, ' +
        '"actor_id" text null, ' +
        '"actor_email" text null, ' +
        '"details" jsonb null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "audit_log_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_audit_log_entity" on "audit_log" ("entity", "entity_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_audit_log_action" on "audit_log" ("action") where "deleted_at" is null;'
    )

    // ---- admin_bookmark ----
    this.addSql(
      'create table if not exists "admin_bookmark" (' +
        '"id" text not null, ' +
        '"user_id" text not null, ' +
        '"target" text not null, ' +
        '"label" text not null, ' +
        '"query" text not null, ' +
        '"sort_order" integer not null default 100, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "admin_bookmark_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_admin_bookmark_user_target" on "admin_bookmark" ("user_id", "target") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "admin_bookmark" cascade;')
    this.addSql('drop table if exists "audit_log" cascade;')
    this.addSql('drop table if exists "order_comment" cascade;')
    this.addSql('drop table if exists "customer_note" cascade;')
    this.addSql('drop table if exists "customer_tag" cascade;')
  }
}
