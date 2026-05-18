import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

import { tierForCustomer, type CustomerGroupLike } from "../../../../../lib/customer-tiers"

/**
 * Returns the logged-in customer's resolved tier (or null).
 *
 * The store /customers/me endpoint whitelists only basic profile fields +
 * addresses + orders for security — customer_groups are admin-scope by
 * design. Storefronts that need to display tier info can hit this route
 * instead. It exposes only the tier slug/name/multiplier — never group IDs
 * or other customers in the same group.
 *
 * Auth: customer session/bearer (auto-applied by the store/customers/me
 * authenticate middleware).
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: groups } = await query.graph({
    entity: "customer_group",
    fields: ["id", "name", "metadata"],
    filters: { customers: { id: customerId } } as any,
  })

  const tier = tierForCustomer({ groups: (groups as CustomerGroupLike[]) ?? [] })

  return res.json({
    tier: tier
      ? {
          slug: tier.slug,
          name: tier.name,
          multiplier: tier.multiplier,
          rank: tier.rank,
        }
      : null,
  })
}
