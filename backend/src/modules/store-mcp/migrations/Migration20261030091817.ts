import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261030091817 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "store_mcp_setup_proposal" ("id" text not null, "grant_id" text null, "user_id" text not null, "app_name" text not null, "summary" text not null, "changes" jsonb not null, "status" text check ("status" in ('pending', 'applying', 'applied', 'discarded', 'failed')) not null default 'pending', "result" jsonb null, "resolved_by" text null, "resolved_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_mcp_setup_proposal_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_setup_proposal_deleted_at" ON "store_mcp_setup_proposal" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_mcp_setup_proposal" cascade;`);
  }

}
