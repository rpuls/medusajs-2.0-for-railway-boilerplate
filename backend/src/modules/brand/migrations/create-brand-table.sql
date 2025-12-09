-- Brand table migration SQL
-- This file can be executed directly in production database

CREATE TABLE IF NOT EXISTS "brand" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "image_url" text NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz NULL,
  CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_brand_name" 
ON "brand" (name) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS "IDX_brand_deleted_at" 
ON "brand" (deleted_at) 
WHERE deleted_at IS NULL;

