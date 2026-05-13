-- Wipe Medusa test data while preserving core store config.
-- Run with: psql "$DATABASE_URL" -f wipe-test-data.sql
-- Backup first: pg_dump "$DATABASE_URL" > ~/medusa-backup-$(date +%Y%m%d-%H%M).sql

BEGIN;

-- =========================================================
-- 1. ORDERS & RELATED (children first → parent last)
-- =========================================================
DO $$
DECLARE
  order_tables text[] := ARRAY[
    'order_item',
    'order_summary',
    'order_shipping',
    'order_shipping_method',
    'order_shipping_method_adjustment',
    'order_shipping_method_tax_line',
    'order_line_item',
    'order_line_item_adjustment',
    'order_line_item_tax_line',
    'order_promotion',
    'order_transaction',
    'order_credit_line',
    'order_claim_item_image',
    'order_claim_item',
    'order_claim',
    'order_exchange_item',
    'order_exchange',
    'return_item',
    'return',
    'order_change_action',
    'order_change',
    'order_address',
    'order'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY order_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 2. CARTS
-- =========================================================
DO $$
DECLARE
  cart_tables text[] := ARRAY[
    'cart_line_item_adjustment',
    'cart_line_item_tax_line',
    'cart_line_item',
    'cart_shipping_method_adjustment',
    'cart_shipping_method_tax_line',
    'cart_shipping_method',
    'cart_address',
    'cart_promotion',
    'cart'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY cart_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 3. PAYMENTS
-- =========================================================
DO $$
DECLARE
  payment_tables text[] := ARRAY[
    'capture',
    'refund',
    'payment',
    'payment_session',
    'payment_collection_payment_providers',
    'payment_collection'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY payment_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 4. FULFILLMENTS / SHIPMENTS
-- =========================================================
DO $$
DECLARE
  fulfillment_tables text[] := ARRAY[
    'fulfillment_item',
    'fulfillment_label',
    'fulfillment_address',
    'shipment_event',
    'fulfillment'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY fulfillment_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 5. INVENTORY (items, not locations)
-- =========================================================
DO $$
DECLARE
  inv_tables text[] := ARRAY[
    'reservation_item',
    'inventory_level',
    'inventory_item'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY inv_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 6. PRODUCTS, PRICING
-- =========================================================
DO $$
DECLARE
  prod_tables text[] := ARRAY[
    'product_variant',
    'product_option_value',
    'product_option',
    'product_image',
    'product_tag',
    'product_type',
    'product_collection',
    'product_category',
    'product'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY prod_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

DO $$
DECLARE
  price_tables text[] := ARRAY[
    'price_rule',
    'price',
    'price_list_rule',
    'price_list',
    'price_preference',
    'price_set'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY price_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 7. PROMOTIONS
-- =========================================================
DO $$
DECLARE
  promo_tables text[] := ARRAY[
    'promotion_rule_value',
    'promotion_rule',
    'promotion_application_method',
    'promotion_campaign_budget',
    'promotion_campaign',
    'promotion'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY promo_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 8. CUSTOMERS (and their customer-only auth)
-- =========================================================
DO $$
DECLARE
  cust_tables text[] := ARRAY[
    'customer_group_customer',
    'customer_address',
    'customer_account_holder',
    'customer_group',
    'customer'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY cust_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- Delete only CUSTOMER auth identities; preserve admin (entity_id matches user.id)
DELETE FROM "provider_identity"
WHERE entity_id NOT IN (SELECT id FROM "user");

DELETE FROM "auth_identity"
WHERE id NOT IN (SELECT auth_identity_id FROM "provider_identity");

-- =========================================================
-- 9. CUSTOM MODULES (Phase 2-4 work + admin extensions)
-- =========================================================
DO $$
DECLARE
  custom_tables text[] := ARRAY[
    'design',
    'brand',
    'search_log',
    'report_alert',
    'report_annotation',
    'automation_rule',
    'admin_workspace'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY custom_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 10. MODULE LINK TABLES (materialized by db:sync-links)
-- Parent CASCADE above should already clear these, but
-- defensive TRUNCATE catches orphans.
-- =========================================================
DO $$
DECLARE
  link_tables text[] := ARRAY[
    'product_sales_channel',
    'product_shipping_profile',
    'order_sales_channel',
    'cart_sales_channel',
    'customer_designs_design',
    'product_brand_brand',
    'product_variant_inventory_item'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY link_tables LOOP
    BEGIN
      EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', t);
    EXCEPTION WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

COMMIT;
