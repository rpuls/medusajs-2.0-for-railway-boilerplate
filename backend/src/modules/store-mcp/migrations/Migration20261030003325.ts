import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261030003325 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_mcp_token" drop constraint if exists "store_mcp_token_token_hash_unique";`);
    this.addSql(`alter table if exists "store_mcp_client" drop constraint if exists "store_mcp_client_client_id_unique";`);
    this.addSql(`alter table if exists "store_mcp_authorization_code" drop constraint if exists "store_mcp_authorization_code_code_hash_unique";`);
    this.addSql(`create table if not exists "store_mcp_authorization_code" ("id" text not null, "code_hash" text not null, "client_id" text not null, "user_id" text not null, "grant_id" text null, "code_challenge" text not null, "redirect_uri" text not null, "resource" text not null, "scope" text null, "expires_at" timestamptz not null, "used_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_mcp_authorization_code_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_store_mcp_authorization_code_code_hash_unique" ON "store_mcp_authorization_code" ("code_hash") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_authorization_code_deleted_at" ON "store_mcp_authorization_code" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "store_mcp_client" ("id" text not null, "client_id" text not null, "client_name" text not null, "client_uri" text null, "logo_uri" text null, "redirect_uris" jsonb not null, "registration_type" text check ("registration_type" in ('dynamic', 'metadata_document')) not null, "token_endpoint_auth_method" text check ("token_endpoint_auth_method" in ('none', 'client_secret_basic', 'client_secret_post')) not null, "client_secret_hash" text null, "metadata" jsonb null, "metadata_expires_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_mcp_client_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_store_mcp_client_client_id_unique" ON "store_mcp_client" ("client_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_client_deleted_at" ON "store_mcp_client" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "store_mcp_grant" ("id" text not null, "client_id" text not null, "user_id" text not null, "resource" text not null, "scope" text null, "last_used_at" timestamptz null, "revoked_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_mcp_grant_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_grant_client_id" ON "store_mcp_grant" ("client_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_grant_user_id" ON "store_mcp_grant" ("user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_grant_deleted_at" ON "store_mcp_grant" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "store_mcp_suggestion" ("id" text not null, "product_id" text not null, "grant_id" text null, "user_id" text not null, "app_name" text not null, "changes" jsonb not null, "note" text null, "status" text check ("status" in ('pending', 'applied', 'discarded')) not null default 'pending', "resolved_by" text null, "resolved_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_mcp_suggestion_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_suggestion_product_id" ON "store_mcp_suggestion" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_suggestion_deleted_at" ON "store_mcp_suggestion" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "store_mcp_token" ("id" text not null, "token_hash" text not null, "type" text check ("type" in ('access', 'refresh')) not null, "grant_id" text not null, "client_id" text not null, "user_id" text not null, "resource" text not null, "scope" text null, "expires_at" timestamptz not null, "used_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_mcp_token_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_store_mcp_token_token_hash_unique" ON "store_mcp_token" ("token_hash") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_token_grant_id" ON "store_mcp_token" ("grant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_mcp_token_deleted_at" ON "store_mcp_token" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_mcp_authorization_code" cascade;`);

    this.addSql(`drop table if exists "store_mcp_client" cascade;`);

    this.addSql(`drop table if exists "store_mcp_grant" cascade;`);

    this.addSql(`drop table if exists "store_mcp_suggestion" cascade;`);

    this.addSql(`drop table if exists "store_mcp_token" cascade;`);
  }

}
