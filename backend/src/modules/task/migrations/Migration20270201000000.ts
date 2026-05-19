import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * CRM Phase 7 — Task entity. One row per staff to-do. Anchored to any
 * combination of customer / order / quote / organisation via denorm
 * FK columns; module links (in src/links/) layer graph-query support
 * on top.
 */
export class Migration20270201000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "task" (' +
        '"id" text not null, ' +
        '"assignee_user_id" text not null, ' +
        '"customer_id" text null, ' +
        '"order_id" text null, ' +
        '"quote_id" text null, ' +
        '"organisation_id" text null, ' +
        '"title" text not null, ' +
        '"body" text null, ' +
        '"due_at" timestamptz null, ' +
        '"status" text not null default \'open\', ' +
        '"priority" text not null default \'normal\', ' +
        '"completed_at" timestamptz null, ' +
        '"completed_by" text null, ' +
        '"created_by" text null, ' +
        '"metadata" jsonb not null default \'{}\', ' +
        '"last_overdue_notified_at" timestamptz null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "task_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_task_assignee_user_id" on "task" ("assignee_user_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_task_status" on "task" ("status") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_task_due_at" on "task" ("due_at") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_task_customer_id" on "task" ("customer_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_task_order_id" on "task" ("order_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_task_quote_id" on "task" ("quote_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_task_organisation_id" on "task" ("organisation_id") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "task" cascade;')
  }
}
