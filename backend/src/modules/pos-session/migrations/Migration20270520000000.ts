import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * POS Phase 1 — Point of sale session table. One row per active
 * walk-in transaction. Items live as a JSONB array until checkout
 * (no separate line-item table — the cart never persists past order
 * creation). See `models/pos-session.ts` for the line-item shape.
 *
 * Renamed from Migration20270401000000 → Migration20270520000000 on
 * 2026-05-20: Mikro-ORM tracks migrations by class name globally
 * across all modules (not per-module), and admin-workspace already
 * owned Migration20270401000000. When that migration ran during the
 * Phase 6 deploy, its class name landed in `mikro_orm_migrations` —
 * so when this POS migration shipped under the same class name,
 * Mikro saw "already executed" and skipped it, leaving `pos_session`
 * uncreated.
 *
 * Lesson: pick globally-unique migration timestamps when adding a new
 * module — grep the whole repo for "Migration{date}" before saving.
 * The CREATE TABLE statement is IF NOT EXISTS so this rename is safe
 * to re-run even if a future environment somehow already has the
 * table from a hand-applied schema fix.
 */
export class Migration20270520000000 extends Migration {
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
