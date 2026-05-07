import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"

import DesignsModule from "../modules/designs"

/**
 * One customer has many saved designs. Phase 2 stored `customer_id` directly
 * on the Design row to keep the storefront filter as a single indexed lookup.
 * This link layers Medusa's graph queries on top so admin/customer queries can
 * traverse `customer.designs` without re-implementing the filter.
 *
 * Run `npx medusa db:sync-links` after adding/changing this file so the link
 * table is materialised in Postgres.
 */
export default defineLink(
  CustomerModule.linkable.customer,
  {
    linkable: DesignsModule.linkable.design,
    isList: true,
  }
)
