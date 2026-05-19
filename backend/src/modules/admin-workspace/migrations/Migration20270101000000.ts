import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * CRM Phase 6 — owner assignment + rotation.
 *
 *   crm_owner_assignment: one row per "X is owned by user_id Y"; linked
 *     to customer and order via module-link tables.
 *   crm_owner_rotation: admin-managed list of staff who are "in
 *     rotation" for new customers/orders. pickNextOwner() rotates
 *     through enabled rows ordered by position then last_picked_at.
 */
export class Migration20270101000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "crm_owner_assignment" (' +
        '"id" text not null, ' +
        '"user_id" text not null, ' +
        '"assigned_at" timestamptz not null default now(), ' +
        '"assigned_by" text null, ' +
        '"reason" text null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "crm_owner_assignment_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create index if not exists "IDX_crm_owner_assignment_user_id" on "crm_owner_assignment" ("user_id") where "deleted_at" is null;'
    )

    this.addSql(
      'create table if not exists "crm_owner_rotation" (' +
        '"id" text not null, ' +
        '"user_id" text not null, ' +
        '"enabled" boolean not null default true, ' +
        '"position" integer not null default 100, ' +
        '"last_picked_at" timestamptz null, ' +
        '"created_at" timestamptz not null default now(), ' +
        '"updated_at" timestamptz not null default now(), ' +
        '"deleted_at" timestamptz null, ' +
        'constraint "crm_owner_rotation_pkey" primary key ("id")' +
        ');'
    )
    this.addSql(
      'create unique index if not exists "IDX_crm_owner_rotation_user_id_unique" on "crm_owner_rotation" ("user_id") where "deleted_at" is null;'
    )
    this.addSql(
      'create index if not exists "IDX_crm_owner_rotation_enabled_position" on "crm_owner_rotation" ("enabled", "position") where "deleted_at" is null;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "crm_owner_rotation" cascade;')
    this.addSql('drop table if exists "crm_owner_assignment" cascade;')
  }
}
