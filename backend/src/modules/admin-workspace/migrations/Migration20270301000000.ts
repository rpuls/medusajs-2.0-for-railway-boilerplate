import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * CRM Phase 8 — Marketing-email suppression table.
 *
 * Hard kill-switch by email address. Used by
 * `shouldSendMarketingEmail()` to block marketing sends whether or
 * not the email belongs to a known customer (guests can unsubscribe).
 *
 * `template_kind` null = global; non-null = per-stream (e.g.
 * "winback").
 */
export class Migration20270301000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "email_suppression" (' +
        '"id" text not null, ' +
        '"email" text not null, ' +
        '"reason" text not null default \'user_unsubscribe\', ' +
        '"template_kind" text null, ' +
        '"source" text null, ' +
        '"notes" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "email_suppression_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_email_suppression_email" on "email_suppression" ("email") where "deleted_at" is null;'
    )
    // (email, template_kind) unique — null template_kind is treated as
    // a distinct value by Postgres so `null + email` co-exists with
    // `template_kind=winback + same_email`.
    this.addSql(
      'create unique index if not exists "IDX_email_suppression_email_kind_unique" on "email_suppression" ("email", "template_kind") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "email_suppression" cascade;')
  }
}
