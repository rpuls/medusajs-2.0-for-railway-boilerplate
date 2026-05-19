import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * POS Phase 1 — Point of sale session table. One row per active
 * walk-in transaction. Items live as a JSONB array until checkout
 * (no separate line-item table — the cart never persists past order
 * creation). See `models/pos-session.ts` for the line-item shape.
 */
export class Migration20270401000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "pos_session" (' +
        '"id" text not null, ' +
        '"created_by_user_id" text not null, ' +
        '"customer_id" text null, ' +
        '"items" jsonb not null default \'[]\', ' +
        '"status" text not null default \'active\', ' +
        '"completed_order_id" text null, ' +
        '"expires_at" timestamptz not null, ' +
        '"metadata" jsonb not null default \'{}\', ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "pos_session_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_pos_session_created_by_user_id" on "pos_session" ("created_by_user_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_pos_session_status" on "pos_session" ("status") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_pos_session_expires_at" on "pos_session" ("expires_at") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "pos_session" cascade;')
  }
}
