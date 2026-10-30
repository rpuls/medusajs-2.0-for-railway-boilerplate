import type { IRegionModuleService, MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { z } from '@medusajs/framework/zod'
import {
  createLocationFulfillmentSetWorkflow,
  createRegionsWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRatesWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRegionsWorkflow,
  updateServiceZonesWorkflow,
  updateProductsWorkflow,
  updateTaxRatesWorkflow,
} from '@medusajs/medusa/core-flows'
import { loadStockLocations, loadVariantStock, stockProblem, writeStock, type StockLocation, type VariantStock } from './stock'
import { queryOf } from './tools/helpers'

/**
 * Proposals: regions, shipping, tax, warehouses and stock, described by an AI app and applied by an
 * admin.
 *
 * None of these have a draft state. A region, a shipping option or a tax rate is live at
 * checkout the moment it exists, so a connected app never writes one. It describes the change,
 * planSetup checks that against the store as it is and turns it into plain-language steps, and
 * only an admin's Apply runs those steps, planned again against the store as it is by then.
 * The admin reads the same plan that runs, so what they approve is what happens.
 *
 * Nothing here deletes, takes a country out of a region or zone, or changes an existing
 * shipping price. The existing values it can change are a country's tax rate, because setting
 * it right is the usual reason to ask, and the shipping profile of up to 50 products, because a
 * new profile is useless without products in it.
 */

const country = z.string().regex(/^[A-Za-z]{2}$/).describe('ISO 3166-1 alpha-2 country code, e.g. "nl"')
const countries = z.array(country).min(1).max(60)
const currency = z.string().regex(/^[A-Za-z]{3}$/).describe('ISO 4217 currency code, e.g. "eur". Must be one of the store currencies.')
const label = (max: number, what: string) => z.string().trim().min(1).max(max).describe(what)

const shippingOption = z.object({
  name: label(100, 'Shown to shoppers at checkout, e.g. "Standard shipping"'),
  speed: z.enum(['standard', 'express']).optional().describe('Default "standard"'),
  description: label(200, 'The delivery promise shown with it, e.g. "2 to 4 business days"').optional(),
  prices: z
    .array(
      z.object({
        currency_code: currency,
        amount: z.number().min(0).max(100_000).describe('Major units: 4.95 means 4.95. 0 is free shipping.'),
      })
    )
    .min(1)
    .max(10)
    .describe('One price for each currency that shoppers in the zone pay in'),
  shipping_profile_id: z.string().optional().describe('An existing shipping profile. Default: the default profile.'),
  shipping_profile_name: label(100, 'Instead of an id: the name of a profile created in this same proposal').optional(),
})

const profileTarget = {
  shipping_profile_id: z.string().optional().describe('An existing shipping profile'),
  shipping_profile_name: label(100, 'Instead of an id: the name of a profile created in this same proposal').optional(),
}

export const setupShape = {
  new_shipping_profiles: z
    .array(z.object({ name: label(100, 'e.g. "Bulky items"') }))
    .max(5)
    .optional()
    .describe(
      'Shipping profiles to create. A profile groups products that ship differently, such as bulky items with their own freight options: shoppers see only the options of a product\'s profile. A new profile needs shipping options, and products moved into it.'
    ),
  new_regions: z
    .array(
      z.object({
        name: label(100, 'Region name, e.g. "North America"'),
        currency_code: currency,
        countries: countries.describe('Countries that are not in any region yet'),
        prices_include_tax: z.boolean().optional().describe('Whether product prices in this region include tax. Default false.'),
      })
    )
    .max(5)
    .optional()
    .describe('Regions to create. A region is a group of countries that pay in the same currency.'),
  add_countries_to_regions: z
    .array(z.object({ region_id: z.string(), countries: countries.describe('Countries that are not in any region yet') }))
    .max(10)
    .optional()
    .describe('Countries to add to existing regions'),
  tax_rates: z
    .array(
      z.object({
        country_code: country,
        rate: z.number().min(0).max(100).describe('Percent: 21 means 21%'),
        name: label(60, 'e.g. "VAT" or "Sales tax". Default "Standard rate"').optional(),
      })
    )
    .max(60)
    .optional()
    .describe("The standard tax rate of each country. Replaces the country's current standard rate."),
  new_shipping_zones: z
    .array(
      z.object({
        name: label(100, 'e.g. "Benelux"'),
        countries,
        fulfillment_set_id: z.string().optional().describe('Where it ships from, from get_store_setup. Needed only when there are several.'),
        ships_from_location_name: label(100, 'Instead of fulfillment_set_id: the name of a warehouse, existing or created in this same proposal').optional(),
        shipping_options: z.array(shippingOption).min(1).max(10),
      })
    )
    .max(5)
    .optional()
    .describe('New areas to ship to, each with its own shipping options'),
  add_countries_to_shipping_zones: z
    .array(z.object({ service_zone_id: z.string(), countries }))
    .max(10)
    .optional()
    .describe("Countries to add to existing shipping zones, which then get those zones' shipping options"),
  new_shipping_options: z
    .array(shippingOption.extend({ service_zone_id: z.string() }))
    .max(20)
    .optional()
    .describe('Shipping options to add to existing shipping zones'),
  new_stock_locations: z
    .array(
      z.object({
        name: label(100, 'e.g. "US Warehouse"'),
        country_code: country,
        city: label(100, 'City').optional(),
        address_1: label(200, 'Street address').optional(),
        postal_code: label(20, 'Postal code').optional(),
      })
    )
    .max(3)
    .optional()
    .describe(
      "Warehouses to create. Each sells through the store's default sales channel and gets an empty shipping setup: give it a shipping zone with ships_from_location_name so its stock can be shipped."
    ),
  stock_levels: z
    .array(
      z.object({
        variant_id: z.string(),
        set_to: z.number().int().min(0).max(10_000_000).optional().describe('The units in stock after this, for a stock count'),
        add: z
          .number()
          .int()
          .min(-1_000_000)
          .max(10_000_000)
          .optional()
          .describe('Units to add, for a delivery that arrived, or negative to remove. Counted from the stock at the moment an admin applies it, so units sold meanwhile are not lost.'),
        stock_location_id: z.string().optional().describe("Default: the store's default stock location"),
        stock_location_name: label(100, 'Instead of an id: a warehouse created in this same proposal').optional(),
      })
    )
    .max(50)
    .optional()
    .describe('Stock per variant and location, each with either set_to or add'),
  assign_products_to_profiles: z
    .array(z.object({ product_ids: z.array(z.string()).min(1).max(50), ...profileTarget }))
    .max(5)
    .optional()
    .describe('Moves products into a shipping profile, at most 50 products per proposal. They then ship only with that profile\'s options.'),
}

export const setupChanges = z.object(setupShape)
export type SetupChanges = z.infer<typeof setupChanges>
type ShippingOptionInput = z.infer<typeof shippingOption>

type Region = { id: string; name: string; currency_code: string; countries: string[]; payment_providers: string[] }
type Zone = { id: string; name: string; fulfillment_set_id: string; geo_zones: Array<{ id: string; type: string; country_code: string }> }
type Option = { id: string; name: string; service_zone_id: string; provider_id: string | null; shipping_profile_id: string; currencies: string[] }
type TaxRegion = { id: string; country_code: string; provider_id: string | null; rate: { id: string; rate: number | null; name: string } | null }

export type SetupState = {
  currencies: string[]
  countryNames: Map<string, string>
  regions: Region[]
  fulfillmentSets: Array<{ id: string; name: string; location: string }>
  locations: StockLocation[]
  defaultLocationId: string | null
  defaultSalesChannelId: string | null
  /** The variants a proposal sets stock for, and only those */
  variants: Map<string, VariantStock>
  zones: Zone[]
  options: Option[]
  profiles: Array<{ id: string; name: string; type: string }>
  taxRegions: TaxRegion[]
  /** Every product up to 2000, with its title, status and shipping profile */
  products: Map<string, { title: string; status: string; shipping_profile_id: string | null }>
  publishedProducts: number
  pricedIn: Map<string, number>
}

/** The store's regions, shipping and tax as they are right now, read through Query */
/** The variants whose stock these proposals set, which loadSetupState then reads */
export const stockedVariantIds = (...proposals: SetupChanges[]): string[] =>
  proposals.flatMap((changes) => (changes.stock_levels ?? []).map((entry) => entry.variant_id))

export const loadSetupState = async (scope: MedusaContainer, variantIds: string[] = []): Promise<SetupState> => {
  const query = queryOf(scope)
  const [stores, regions, locations, options, profiles, taxRegions, products, allCountries, stockLocations, variants] = await Promise.all([
    query.graph({ entity: 'store', fields: ['supported_currencies.currency_code'] }),
    query.graph({ entity: 'region', fields: ['id', 'name', 'currency_code', 'countries.iso_2', 'payment_providers.id'] }),
    query.graph({
      entity: 'stock_location',
      fields: [
        'id',
        'name',
        'fulfillment_sets.id',
        'fulfillment_sets.name',
        'fulfillment_sets.type',
        'fulfillment_sets.service_zones.id',
        'fulfillment_sets.service_zones.name',
        'fulfillment_sets.service_zones.geo_zones.id',
        'fulfillment_sets.service_zones.geo_zones.type',
        'fulfillment_sets.service_zones.geo_zones.country_code',
      ],
    }),
    query.graph({
      entity: 'shipping_option',
      fields: [
        'id',
        'name',
        'service_zone_id',
        'provider_id',
        'shipping_profile_id',
        'rules.attribute',
        'rules.value',
        'prices.currency_code',
        'prices.rules_count',
      ],
    }),
    query.graph({ entity: 'shipping_profile', fields: ['id', 'name', 'type'] }),
    query.graph({
      entity: 'tax_region',
      fields: ['id', 'country_code', 'province_code', 'parent_id', 'provider_id', 'tax_rates.id', 'tax_rates.rate', 'tax_rates.name', 'tax_rates.is_default'],
    }),
    query.graph({
      entity: 'product',
      fields: ['id', 'title', 'status', 'shipping_profile.id', 'variants.prices.currency_code'],
      pagination: { take: 2000 },
    }),
    scope.resolve<IRegionModuleService>(Modules.REGION).listCountries({}, { take: 1000 }),
    loadStockLocations(scope),
    loadVariantStock(scope, variantIds),
  ])

  const fulfillmentSets: SetupState['fulfillmentSets'] = []
  const zones: Zone[] = []
  for (const location of locations.data as any[]) {
    for (const set of location.fulfillment_sets ?? []) {
      if (set.type !== 'shipping') continue
      fulfillmentSets.push({ id: set.id, name: set.name, location: location.name })
      for (const zone of set.service_zones ?? []) {
        zones.push({ id: zone.id, name: zone.name, fulfillment_set_id: set.id, geo_zones: zone.geo_zones ?? [] })
      }
    }
  }

  // A product counts as sellable in a currency when every variant has a price in it
  const published = (products.data as any[]).filter((product) => product.status === 'published')
  const pricedIn = new Map<string, number>()
  for (const product of published) {
    const variants: any[] = product.variants ?? []
    const perVariant = variants.map((v) => new Set<string>((v.prices ?? []).map((p: any) => p.currency_code)))
    const all = new Set(perVariant.flatMap((set) => [...set]))
    for (const code of all) {
      if (perVariant.every((set) => set.has(code))) pricedIn.set(code, (pricedIn.get(code) ?? 0) + 1)
    }
  }

  return {
    currencies: ((stores.data[0] as any)?.supported_currencies ?? []).map((c: any) => c.currency_code),
    countryNames: new Map(allCountries.map((c) => [c.iso_2.toLowerCase(), c.display_name])),
    regions: (regions.data as any[]).map((r) => ({
      id: r.id,
      name: r.name,
      currency_code: r.currency_code,
      countries: (r.countries ?? []).map((c: any) => c.iso_2),
      payment_providers: (r.payment_providers ?? []).map((p: any) => p.id),
    })),
    fulfillmentSets,
    locations: stockLocations.locations,
    defaultLocationId: stockLocations.defaultLocationId,
    defaultSalesChannelId: stockLocations.defaultSalesChannelId,
    variants,
    zones,
    options: (options.data as any[])
      .filter((o) => !(o.rules ?? []).some((rule: any) => rule.attribute === 'is_return' && String(rule.value) === 'true'))
      .map((o) => ({
        id: o.id,
        name: o.name,
        service_zone_id: o.service_zone_id,
        provider_id: o.provider_id ?? null,
        shipping_profile_id: o.shipping_profile_id,
        // Prices with rules are region overrides; the currency prices are what every shopper falls back to
        currencies: [...new Set<string>((o.prices ?? []).filter((p: any) => !p.rules_count).map((p: any) => p.currency_code))],
      })),
    profiles: profiles.data as SetupState['profiles'],
    taxRegions: (taxRegions.data as any[])
      .filter((t) => !t.province_code && !t.parent_id)
      .map((t) => {
        const rate = (t.tax_rates ?? []).find((r: any) => r.is_default)
        return {
          id: t.id,
          country_code: t.country_code,
          provider_id: t.provider_id ?? null,
          rate: rate ? { id: rate.id, rate: rate.rate, name: rate.name } : null,
        }
      }),
    products: new Map(
      (products.data as any[]).map((product) => [
        product.id,
        { title: product.title, status: product.status, shipping_profile_id: product.shipping_profile?.id ?? null },
      ])
    ),
    publishedProducts: published.length,
    pricedIn,
  }
}

type Step = { line: string; run: (scope: MedusaContainer) => Promise<unknown> }
export type SetupPlan = { steps: Step[]; warnings: string[]; errors: string[] }

const PAYMENT_PROVIDER_NAMES: Record<string, string> = {
  pp_system_default: 'manual payment',
  pp_stripe_stripe: 'Stripe',
}

const listOf = (items: string[]): string =>
  items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items.join('')

const money = (amount: number, code: string): string => {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: code.toUpperCase() }).format(amount)
  } catch {
    return `${amount} ${code.toUpperCase()}`
  }
}

const lowerUnique = (codes: string[]): string[] => [...new Set(codes.map((code) => code.toLowerCase()))]

/** Merges entries that name the same id, so two of them cannot each overwrite the other's countries */
const byId = <K extends string>(entries: Array<Record<K, string> & { countries: string[] }>, key: K) => {
  const merged = new Map<string, string[]>()
  for (const entry of entries) merged.set(entry[key], [...(merged.get(entry[key]) ?? []), ...entry.countries])
  return merged
}

/**
 * Checks a proposal against the store and turns it into the steps Apply would run, each with
 * the sentence the admin reads. Errors mean it cannot be applied as it stands; warnings are
 * consequences the admin should know about, such as a country that will have no way to ship.
 */
export const planSetup = (state: SetupState, changes: SetupChanges): SetupPlan => {
  const steps: Step[] = []
  const warnings: string[] = []
  const errors: string[] = []

  const nameOf = (code: string) => state.countryNames.get(code) ?? code.toUpperCase()
  const names = (codes: string[]) => listOf(codes.map(nameOf))
  const unknownCountries = (codes: string[]) => codes.filter((code) => !state.countryNames.has(code))
  const storeCurrencies = new Set(state.currencies)

  // Which region and currency every country sells in, once this proposal is applied
  const regionOf = new Map<string, { name: string; currency: string }>()
  for (const region of state.regions) {
    for (const code of region.countries) regionOf.set(code, { name: region.name, currency: region.currency_code })
  }
  const newlySold = new Set<string>()
  const claim = (code: string, region: string, currencyCode: string): boolean => {
    if (!state.countryNames.has(code)) {
      errors.push(`"${code}" is not a country code Medusa knows.`)
      return false
    }
    const current = regionOf.get(code)
    if (current) {
      errors.push(`${nameOf(code)} is already in region "${current.name}". A country can be in one region only.`)
      return false
    }
    regionOf.set(code, { name: region, currency: currencyCode })
    newlySold.add(code)
    return true
  }

  // Payment methods for a new region: whatever the existing regions offer, so Stripe carries over
  const existingProviders = [...new Set(state.regions.flatMap((region) => region.payment_providers))]
  const paymentProviders = existingProviders.length ? existingProviders : ['pp_system_default']

  for (const region of changes.new_regions ?? []) {
    const code = region.currency_code.toLowerCase()
    if (!storeCurrencies.has(code)) {
      errors.push(
        `Region "${region.name}": the store does not sell in ${code.toUpperCase()}. Its currencies are ${state.currencies.join(', ').toUpperCase()}; an admin adds others under Settings > Store.`
      )
      continue
    }
    const list = lowerUnique(region.countries).filter((c) => claim(c, region.name, code))
    if (!list.length) continue
    const unpriced = state.publishedProducts - (state.pricedIn.get(code) ?? 0)
    if (unpriced > 0) {
      warnings.push(
        `${unpriced} of ${state.publishedProducts} published products have no ${code.toUpperCase()} price, so shoppers in "${region.name}" cannot buy them until they get one.`
      )
    }
    steps.push({
      line: `Create region "${region.name}" for ${names(list)}, in ${code.toUpperCase()}${
        region.prices_include_tax ? ', with prices that include tax' : ''
      }. Payment: ${listOf(paymentProviders.map((id) => PAYMENT_PROVIDER_NAMES[id] ?? id))}.`,
      run: (scope) =>
        createRegionsWorkflow(scope).run({
          input: {
            regions: [
              {
                name: region.name,
                currency_code: code,
                countries: list,
                payment_providers: paymentProviders,
                is_tax_inclusive: region.prices_include_tax ?? false,
              },
            ],
          },
        }),
    })
  }

  for (const [regionId, codes] of byId(changes.add_countries_to_regions ?? [], 'region_id')) {
    const region = state.regions.find((r) => r.id === regionId)
    if (!region) {
      errors.push(`No region with id ${regionId}.`)
      continue
    }
    const list = lowerUnique(codes).filter((c) => claim(c, region.name, region.currency_code))
    if (!list.length) continue
    steps.push({
      line: `Add ${names(list)} to region "${region.name}" (${region.currency_code.toUpperCase()}).`,
      // The update replaces the region's countries, so it carries the current ones along
      run: (scope) =>
        updateRegionsWorkflow(scope).run({ input: { selector: { id: region.id }, update: { countries: [...region.countries, ...list] } } }),
    })
  }

  const taxByCountry = new Map(state.taxRegions.map((t) => [t.country_code, t]))
  const taxProvider = state.taxRegions.find((t) => t.provider_id)?.provider_id ?? 'tp_system'
  const rated = new Set(state.taxRegions.filter((t) => t.rate).map((t) => t.country_code))
  const seenTax = new Set<string>()
  for (const entry of changes.tax_rates ?? []) {
    const code = entry.country_code.toLowerCase()
    if (!state.countryNames.has(code)) {
      errors.push(`"${code}" is not a country code Medusa knows.`)
      continue
    }
    if (seenTax.has(code)) {
      errors.push(`${nameOf(code)} has two tax rates in this proposal.`)
      continue
    }
    seenTax.add(code)
    rated.add(code)
    const name = entry.name ?? 'Standard rate'
    const taxCode = `${code}-${name}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '')
    const existing = taxByCountry.get(code)
    if (!regionOf.has(code)) warnings.push(`${nameOf(code)} is not in any region, so its tax rate only applies once the store sells there.`)

    if (existing?.rate) {
      const current = existing.rate
      if (current.rate === entry.rate && current.name === name) continue
      steps.push({
        line: `Change the tax rate for ${nameOf(code)} from ${current.rate ?? 0}% to ${entry.rate}% (${name}).`,
        run: (scope) => updateTaxRatesWorkflow(scope).run({ input: { selector: { id: current.id }, update: { rate: entry.rate, name } } }),
      })
    } else if (existing) {
      steps.push({
        line: `Set the tax rate for ${nameOf(code)} to ${entry.rate}% (${name}).`,
        run: (scope) =>
          createTaxRatesWorkflow(scope).run({ input: [{ tax_region_id: existing.id, rate: entry.rate, name, code: taxCode, is_default: true }] }),
      })
    } else {
      steps.push({
        line: `Set the tax rate for ${nameOf(code)} to ${entry.rate}% (${name}).`,
        run: (scope) =>
          createTaxRegionsWorkflow(scope).run({
            input: [{ country_code: code, provider_id: taxProvider, default_tax_rate: { rate: entry.rate, name, code: taxCode } }],
          }),
      })
    }
  }

  // Warehouses. Like a new profile, a new warehouse has no id until Apply creates it, so zones and
  // stock that name it resolve the ids while the plan runs, through createdLocations.
  const createdLocations = new Map<string, { locationId: string; setId: string }>()
  const newLocationNames = new Map<string, string>()
  const defaultLocation = state.locations.find((l) => l.id === state.defaultLocationId) ?? state.locations[0]
  const newLocationProviders = defaultLocation?.fulfillment_provider_ids.length ? defaultLocation.fulfillment_provider_ids : ['manual_manual']
  for (const location of changes.new_stock_locations ?? []) {
    const key = location.name.toLowerCase()
    const code = location.country_code.toLowerCase()
    if (state.locations.some((l) => l.name.toLowerCase() === key) || newLocationNames.has(key)) {
      errors.push(`There is already a stock location called "${location.name}".`)
      continue
    }
    if (!state.countryNames.has(code)) {
      errors.push(`Warehouse "${location.name}": "${location.country_code}" is not a country code Medusa knows.`)
      continue
    }
    newLocationNames.set(key, location.name)
    const channel = state.defaultSalesChannelId
    steps.push({
      line: `Create warehouse "${location.name}" in ${location.city ? `${location.city}, ` : ''}${nameOf(code)}, selling through the default sales channel.`,
      run: async (scope) => {
        const { result } = await createStockLocationsWorkflow(scope).run({
          input: {
            locations: [
              {
                name: location.name,
                address: { country_code: code.toUpperCase(), city: location.city, address_1: location.address_1 ?? '', postal_code: location.postal_code },
              },
            ],
          },
        })
        const locationId = result[0].id
        if (channel) await linkSalesChannelsToStockLocationWorkflow(scope).run({ input: { id: locationId, add: [channel] } })
        // The same fulfillment providers as the default location, so its shipping options work here too
        await scope.resolve(ContainerRegistrationKeys.LINK).create(
          newLocationProviders.map((providerId) => ({
            [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
            [Modules.FULFILLMENT]: { fulfillment_provider_id: providerId },
          }))
        )
        await createLocationFulfillmentSetWorkflow(scope).run({
          input: { location_id: locationId, fulfillment_set_data: { name: `${location.name} shipping`, type: 'shipping' } },
        })
        const { data } = await queryOf(scope).graph({
          entity: 'stock_location',
          fields: ['fulfillment_sets.id', 'fulfillment_sets.type'],
          filters: { id: locationId },
        })
        const set = ((data[0] as any)?.fulfillment_sets ?? []).find((f: any) => f.type === 'shipping')
        createdLocations.set(key, { locationId, setId: set.id })
      },
    })
  }
  const shippedFromNew = new Set<string>()

  // Shipping profiles. One this proposal creates has no id until Apply creates it, so whatever
  // names it resolves the id while the plan runs, through createdProfiles.
  const defaultProfile = state.profiles.find((p) => p.type === 'default') ?? state.profiles[0]
  const createdProfiles = new Map<string, string>()
  const newProfileNames = new Map<string, string>()
  for (const profile of changes.new_shipping_profiles ?? []) {
    const key = profile.name.toLowerCase()
    if (state.profiles.some((p) => p.name.toLowerCase() === key) || newProfileNames.has(key)) {
      errors.push(`There is already a shipping profile called "${profile.name}".`)
      continue
    }
    newProfileNames.set(key, profile.name)
    steps.push({
      line: `Create shipping profile "${profile.name}".`,
      run: async (scope) => {
        const { result } = await createShippingProfilesWorkflow(scope).run({ input: { data: [{ name: profile.name, type: 'custom' }] } })
        createdProfiles.set(key, result[0].id)
      },
    })
  }

  type ProfileRef = { key: string; label: string; isDefault: boolean; id: () => string }
  const resolveProfile = (ref: { shipping_profile_id?: string; shipping_profile_name?: string }, where: string): ProfileRef | null => {
    const existing = ref.shipping_profile_id
      ? state.profiles.find((p) => p.id === ref.shipping_profile_id)
      : ref.shipping_profile_name
        ? state.profiles.find((p) => p.name.toLowerCase() === ref.shipping_profile_name!.toLowerCase())
        : defaultProfile
    if (existing) return { key: existing.id, label: existing.name, isDefault: existing.id === defaultProfile?.id, id: () => existing.id }
    const key = ref.shipping_profile_name?.toLowerCase()
    if (key && newProfileNames.has(key)) {
      return { key: `new:${key}`, label: newProfileNames.get(key)!, isDefault: false, id: () => createdProfiles.get(key)! }
    }
    errors.push(
      ref.shipping_profile_id
        ? `${where}: no shipping profile with id ${ref.shipping_profile_id}.`
        : ref.shipping_profile_name
          ? `${where}: no shipping profile called "${ref.shipping_profile_name}", and this proposal does not create one.`
          : `${where}: the store has no shipping profile.`
    )
    return null
  }

  // Shipping. Every zone, existing or proposed, with the countries and options it ends up with,
  // so the checks below see the store as it will be.
  type PlannedZone = {
    name: string
    countries: Set<string>
    options: Array<{ name: string; currencies: string[]; profile: string }>
    touched: boolean
  }
  const planned = new Map<string, PlannedZone>()
  for (const zone of state.zones) {
    planned.set(zone.id, {
      name: zone.name,
      countries: new Set(zone.geo_zones.filter((g) => g.type === 'country').map((g) => g.country_code)),
      options: state.options
        .filter((o) => o.service_zone_id === zone.id)
        .map((o) => ({ name: o.name, currencies: o.currencies, profile: o.shipping_profile_id })),
      touched: false,
    })
  }
  const zonesCovering = (code: string, except?: string) =>
    [...planned.entries()].filter(([id, zone]) => id !== except && zone.countries.has(code)).map(([, zone]) => `"${zone.name}"`)

  const zoneById = new Map(state.zones.map((zone) => [zone.id, zone]))
  const providerFor = (fulfillmentSetId: string) =>
    state.options.find((o) => o.provider_id && zoneById.get(o.service_zone_id)?.fulfillment_set_id === fulfillmentSetId)?.provider_id ??
    'manual_manual'

  const optionErrors = (option: ShippingOptionInput, where: string): string[] => {
    const problems: string[] = []
    const bad = option.prices.map((p) => p.currency_code.toLowerCase()).filter((code) => !storeCurrencies.has(code))
    if (bad.length) problems.push(`${where}: "${option.name}" is priced in ${bad.join(', ').toUpperCase()}, which the store does not sell in.`)
    return problems
  }
  const optionLine = (option: ShippingOptionInput, profile: ProfileRef) =>
    `${option.name} (${option.prices.map((p) => money(p.amount, p.currency_code)).join(' / ')})${
      profile.isDefault ? '' : ` for shipping profile "${profile.label}"`
    }`
  const optionInput = (option: ShippingOptionInput, serviceZoneId: string, providerId: string, profile: ProfileRef) => {
    const speed = option.speed ?? 'standard'
    return {
      name: option.name,
      price_type: 'flat' as const,
      provider_id: providerId,
      service_zone_id: serviceZoneId,
      shipping_profile_id: profile.id(),
      type: {
        label: speed === 'express' ? 'Express' : 'Standard',
        description: option.description ?? (speed === 'express' ? 'Fast delivery' : 'Regular delivery'),
        code: speed,
      },
      prices: option.prices.map((p) => ({ currency_code: p.currency_code.toLowerCase(), amount: p.amount })),
      rules: [
        { attribute: 'enabled_in_store', value: 'true', operator: 'eq' as const },
        { attribute: 'is_return', value: 'false', operator: 'eq' as const },
      ],
    }
  }

  ;(changes.new_shipping_zones ?? []).forEach((zone, index) => {
    const where = `Shipping zone "${zone.name}"`
    const sets = state.fulfillmentSets
    let shipsFrom: { label: string; id: () => string; providerId: string } | undefined
    if (zone.ships_from_location_name) {
      const key = zone.ships_from_location_name.toLowerCase()
      const existing = state.locations.find((l) => l.name.toLowerCase() === key)
      if (existing?.shipping_set_id) {
        const setId = existing.shipping_set_id
        shipsFrom = { label: existing.name, id: () => setId, providerId: providerFor(setId) }
      } else if (newLocationNames.has(key)) {
        shippedFromNew.add(key)
        shipsFrom = { label: newLocationNames.get(key)!, id: () => createdLocations.get(key)!.setId, providerId: newLocationProviders[0] }
      } else {
        errors.push(`${where}: no warehouse called "${zone.ships_from_location_name}" that has shipping set up.`)
        return
      }
    } else {
      const set = zone.fulfillment_set_id ? sets.find((s) => s.id === zone.fulfillment_set_id) : sets.length === 1 ? sets[0] : undefined
      if (!set) {
        errors.push(
          zone.fulfillment_set_id
            ? `${where}: no fulfillment set with id ${zone.fulfillment_set_id}.`
            : sets.length
              ? `${where}: say which fulfillment_set_id it ships from: ${sets.map((s) => `${s.id} (${s.name}, at ${s.location})`).join(', ')}.`
              : 'There is nowhere to ship from yet. Propose a warehouse with new_stock_locations and ship from it with ships_from_location_name.'
        )
        return
      }
      shipsFrom = { label: set.location, id: () => set.id, providerId: providerFor(set.id) }
    }
    const from = shipsFrom
    const list = lowerUnique(zone.countries)
    const unknown = unknownCountries(list)
    if (unknown.length) {
      errors.push(`${where}: ${unknown.map((c) => `"${c}"`).join(', ')} is not a country code Medusa knows.`)
      return
    }
    const problems = zone.shipping_options.flatMap((option) => optionErrors(option, where))
    const profiles = zone.shipping_options.map((option) => resolveProfile(option, where))
    if (problems.length || profiles.some((profile) => !profile)) {
      errors.push(...problems)
      return
    }
    const profileOf = (index: number) => profiles[index]!
    for (const code of list) {
      const others = zonesCovering(code)
      if (others.length) warnings.push(`${nameOf(code)} is already in shipping zone ${listOf(others)}, so shoppers there will see the options of both.`)
    }
    planned.set(`new-${index}`, {
      name: zone.name,
      countries: new Set(list),
      options: zone.shipping_options.map((o, i) => ({
        name: o.name,
        currencies: o.prices.map((p) => p.currency_code.toLowerCase()),
        profile: profileOf(i).key,
      })),
      touched: true,
    })
    steps.push({
      line: `Create shipping zone "${zone.name}" for ${names(list)}, shipping from ${from.label}, with ${listOf(zone.shipping_options.map((o, i) => optionLine(o, profileOf(i))))}.`,
      run: async (scope) => {
        const { result } = await createServiceZonesWorkflow(scope).run({
          input: { data: [{ name: zone.name, fulfillment_set_id: from.id(), geo_zones: list.map((c) => ({ type: 'country' as const, country_code: c })) }] },
        })
        await createShippingOptionsWorkflow(scope).run({
          input: zone.shipping_options.map((o, i) => optionInput(o, result[0].id, from.providerId, profileOf(i))),
        })
      },
    })
  })

  for (const [zoneId, codes] of byId(changes.add_countries_to_shipping_zones ?? [], 'service_zone_id')) {
    const zone = zoneById.get(zoneId)
    const plan = planned.get(zoneId)
    if (!zone || !plan) {
      errors.push(`No shipping zone with id ${zoneId}.`)
      continue
    }
    const requested = lowerUnique(codes)
    const unknown = unknownCountries(requested)
    if (unknown.length) {
      errors.push(`Shipping zone "${zone.name}": ${unknown.map((c) => `"${c}"`).join(', ')} is not a country code Medusa knows.`)
      continue
    }
    const list = requested.filter((code) => !plan.countries.has(code))
    if (!list.length) {
      warnings.push(`Shipping zone "${zone.name}" already ships to ${names(requested)}.`)
      continue
    }
    for (const code of list) {
      const others = zonesCovering(code, zoneId)
      if (others.length) warnings.push(`${nameOf(code)} is already in shipping zone ${listOf(others)}, so shoppers there will see the options of both.`)
      plan.countries.add(code)
    }
    plan.touched = true
    steps.push({
      line: `Ship to ${names(list)} from shipping zone "${zone.name}"${
        plan.options.length ? `, with its options ${listOf(plan.options.map((o) => `"${o.name}"`))}` : ''
      }.`,
      // The update replaces the zone's geo zones; listing the current ones by id keeps them
      run: (scope) =>
        updateServiceZonesWorkflow(scope).run({
          input: {
            selector: { id: zone.id },
            update: {
              geo_zones: [
                ...zone.geo_zones.map((g) => ({ id: g.id })),
                ...list.map((c) => ({ type: 'country' as const, country_code: c })),
              ],
            },
          },
        }),
    })
  }

  for (const option of changes.new_shipping_options ?? []) {
    const zone = zoneById.get(option.service_zone_id)
    const plan = planned.get(option.service_zone_id)
    if (!zone || !plan) {
      errors.push(`Shipping option "${option.name}": no shipping zone with id ${option.service_zone_id}.`)
      continue
    }
    const problems = optionErrors(option, `Shipping zone "${zone.name}"`)
    const profile = resolveProfile(option, `Shipping option "${option.name}"`)
    if (problems.length || !profile) {
      errors.push(...problems)
      continue
    }
    plan.options.push({ name: option.name, currencies: option.prices.map((p) => p.currency_code.toLowerCase()), profile: profile.key })
    plan.touched = true
    const providerId = providerFor(zone.fulfillment_set_id)
    steps.push({
      line: `Add shipping option ${optionLine(option, profile)} to shipping zone "${zone.name}".`,
      run: (scope) => createShippingOptionsWorkflow(scope).run({ input: [optionInput(option, zone.id, providerId, profile)] }),
    })
  }

  // Products into profiles, last, so the options they will need exist by the time they move
  const profileAfter = new Map<string, string>()
  let moving = 0
  for (const entry of changes.assign_products_to_profiles ?? []) {
    const profile = resolveProfile(entry, 'Moving products')
    if (!profile) continue
    const ids = [...new Set(entry.product_ids)]
    const unknown = ids.filter((id) => !state.products.has(id))
    if (unknown.length) {
      errors.push(`No product with id ${unknown.join(', ')}.`)
      continue
    }
    for (const id of ids) profileAfter.set(id, profile.key)
    const toMove = ids.filter((id) => state.products.get(id)!.shipping_profile_id !== profile.key)
    moving += toMove.length
    if (!toMove.length) continue
    const titles = toMove.map((id) => `"${state.products.get(id)!.title}"`)
    const which = titles.length > 6 ? `${titles.slice(0, 6).join(', ')} and ${titles.length - 6} more products` : listOf(titles)
    steps.push({
      line: `Move ${which} to shipping profile "${profile.label}".`,
      run: (scope) =>
        updateProductsWorkflow(scope).run({ input: { products: toMove.map((id) => ({ id, shipping_profile_id: profile.id() })) } }),
    })
  }
  if (moving > 50) errors.push(`A proposal moves at most 50 products; this one moves ${moving}.`)

  // Stock, last of all, so new warehouses and their shipping exist when it lands
  type LocationRef = { key: string; label: string; id: () => string; salesChannelIds: string[]; ships: boolean }
  const resolveLocation = (ref: { stock_location_id?: string; stock_location_name?: string }, where: string): LocationRef | null => {
    const existing = ref.stock_location_id
      ? state.locations.find((l) => l.id === ref.stock_location_id)
      : ref.stock_location_name
        ? state.locations.find((l) => l.name.toLowerCase() === ref.stock_location_name!.toLowerCase())
        : defaultLocation
    if (existing) {
      return { key: existing.id, label: existing.name, id: () => existing.id, salesChannelIds: existing.sales_channel_ids, ships: existing.ships }
    }
    const key = ref.stock_location_name?.toLowerCase()
    if (key && newLocationNames.has(key)) {
      return {
        key: `new:${key}`,
        label: newLocationNames.get(key)!,
        id: () => createdLocations.get(key)!.locationId,
        salesChannelIds: state.defaultSalesChannelId ? [state.defaultSalesChannelId] : [],
        ships: shippedFromNew.has(key),
      }
    }
    errors.push(
      ref.stock_location_id
        ? `${where}: no stock location with id ${ref.stock_location_id}.`
        : ref.stock_location_name
          ? `${where}: no stock location called "${ref.stock_location_name}", and this proposal does not create one.`
          : `${where}: the store has no stock location. Propose one with new_stock_locations.`
    )
    return null
  }
  const stockTargets = new Set<string>()
  // Stocking a new warehouse or product touches every variant, and twenty near-identical lines
  // bury the rest of the proposal. Levels created with the same quantity are told per product,
  // and the warnings per warehouse.
  type NewStock = { target: number; product: string; count: number; location: string; variants: VariantStock[]; locationId: () => string }
  const stockLines: Array<Step | NewStock> = []
  const newStock = new Map<string, NewStock>()
  const unseen = new Map<string, Set<string>>()
  const shipsNothing = new Map<string, Set<string>>()
  const note = (into: Map<string, Set<string>>, location: string, product: string) =>
    into.set(location, (into.get(location) ?? new Set()).add(`"${product}"`))
  for (const entry of changes.stock_levels ?? []) {
    const variant = state.variants.get(entry.variant_id)
    if (!variant) {
      errors.push(`No product variant with id ${entry.variant_id}.`)
      continue
    }
    const where = `Stock of "${variant.label}"`
    const problem = stockProblem(variant)
    if (problem) {
      errors.push(problem)
      continue
    }
    if ((entry.set_to === undefined) === (entry.add === undefined)) {
      errors.push(`${where}: give either set_to or add.`)
      continue
    }
    const location = resolveLocation(entry, where)
    if (!location) continue
    if (stockTargets.has(`${variant.id}@${location.key}`)) {
      errors.push(`${where} at ${location.label} appears twice in this proposal.`)
      continue
    }
    stockTargets.add(`${variant.id}@${location.key}`)
    const level = variant.levels.find((l) => l.location_id === location.key)
    const current = level?.stocked ?? 0
    const target = entry.set_to ?? current + entry.add!
    if (target < 0) {
      errors.push(`${where} at ${location.label} would go below zero: there are ${current}.`)
      continue
    }
    if (level && target === current) continue
    if (level && target < level.reserved) {
      warnings.push(`${level.reserved} units of "${variant.label}" are reserved by orders at ${location.label}, more than the ${target} it will have.`)
    }
    if (!variant.sales_channel_ids.some((id) => location.salesChannelIds.includes(id))) {
      note(unseen, location.label, variant.product_title)
    } else if (!location.ships) {
      note(shipsNothing, location.label, variant.product_title)
    }
    if (!level) {
      const key = `${location.key}|${variant.product_id}|${target}`
      const group = newStock.get(key)
      if (group) {
        group.variants.push(variant)
      } else {
        const created: NewStock = {
          target,
          product: variant.product_title,
          count: variant.product_variant_count,
          location: location.label,
          variants: [variant],
          locationId: location.id,
        }
        newStock.set(key, created)
        stockLines.push(created)
      }
      continue
    }
    const inventoryItemId = variant.inventory_item_id!
    stockLines.push({
      line:
        entry.add !== undefined
          ? `${entry.add >= 0 ? 'Add' : 'Remove'} ${Math.abs(entry.add)} of "${variant.label}" at ${location.label}: from ${current} to ${target}.`
          : `Set the stock of "${variant.label}" at ${location.label} from ${current} to ${target}.`,
      run: (scope) => writeStock(scope, inventoryItemId, location.id(), target, true),
    })
  }
  for (const item of stockLines) {
    if ('run' in item) {
      steps.push(item)
      continue
    }
    const { target, product, count, location, variants, locationId } = item
    const which =
      variants.length === 1
        ? `${target} of "${variants[0].label}"`
        : variants.length === count
          ? `${target} of each of the ${count} variants of "${product}"`
          : `${target} each of "${product}" ${listOf(variants.map((v) => v.variant_title))}`
    steps.push({
      line: `Stock ${which} at ${location}, which had none there.`,
      run: async (scope) => {
        for (const variant of variants) await writeStock(scope, variant.inventory_item_id!, locationId(), target, false)
      },
    })
  }
  for (const [location, products] of unseen) {
    warnings.push(`${location} does not sell through the sales channels of ${listOf([...products])}, so shoppers do not see that stock.`)
  }
  for (const [location, products] of shipsNothing) {
    warnings.push(`Nothing ships from ${location} yet, so its stock of ${listOf([...products])} cannot be sold.`)
  }

  // What the store will look like for the countries this proposal touches
  for (const zone of planned.values()) {
    const affected = [...zone.countries].filter((code) => zone.touched || newlySold.has(code))
    for (const option of zone.options) {
      const missing = new Map<string, string[]>()
      for (const code of affected) {
        const sold = regionOf.get(code)
        if (sold && !option.currencies.includes(sold.currency)) missing.set(sold.currency, [...(missing.get(sold.currency) ?? []), code])
      }
      for (const [code, where] of missing) {
        warnings.push(
          `Shipping option "${option.name}" in zone "${zone.name}" has no ${code.toUpperCase()} price, so shoppers in ${names(where)} cannot choose it.`
        )
      }
    }
  }
  const shippedTo = new Set([...planned.values()].flatMap((zone) => [...zone.countries]))
  const newlyShipped = new Set([...planned.values()].filter((zone) => zone.touched).flatMap((zone) => [...zone.countries]))
  const unshipped = [...newlySold].filter((code) => !shippedTo.has(code))
  if (unshipped.length) warnings.push(`No shipping zone covers ${names(unshipped)}, so shoppers there cannot check out.`)
  const unsold = [...newlyShipped].filter((code) => !regionOf.has(code))
  if (unsold.length) warnings.push(`${names(unsold)} ${unsold.length > 1 ? 'are' : 'is'} not in any region, so the store does not sell there yet.`)
  const untaxed = [...newlySold].filter((code) => !rated.has(code))
  if (untaxed.length) warnings.push(`No tax rate is set for ${names(untaxed)}, so orders there are charged no tax.`)

  for (const [key, name] of newLocationNames) {
    if (!shippedFromNew.has(key)) {
      warnings.push(`Nothing ships from warehouse "${name}" yet. Give it a shipping zone with ships_from_location_name, or its stock cannot be sold.`)
    }
  }

  // Every profile this proposal creates or moves products into: can its products reach every
  // country the store sells to?
  const touchedProfiles = new Set([...[...newProfileNames.keys()].map((key) => `new:${key}`), ...profileAfter.values()])
  for (const key of touchedProfiles) {
    const label = key.startsWith('new:') ? newProfileNames.get(key.slice(4))! : (state.profiles.find((p) => p.id === key)?.name ?? key)
    const hasProducts = [...state.products.entries()].some(([id, product]) => (profileAfter.get(id) ?? product.shipping_profile_id) === key)
    const covered = new Set(
      [...planned.values()].filter((zone) => zone.options.some((o) => o.profile === key)).flatMap((zone) => [...zone.countries])
    )
    if (!covered.size) {
      warnings.push(`Shipping profile "${label}" has no shipping options, so products in it cannot be bought.`)
      continue
    }
    if (!hasProducts) {
      warnings.push(`No products are in shipping profile "${label}" yet. Move products into it, in this proposal or in the dashboard.`)
      continue
    }
    const missing = [...regionOf.keys()].filter((code) => !covered.has(code))
    if (missing.length) {
      const where = missing.length > 8 ? `${missing.slice(0, 8).map(nameOf).join(', ')} and ${missing.length - 8} more countries` : names(missing)
      warnings.push(`Products in shipping profile "${label}" cannot be shipped to ${where}.`)
    }
  }

  if (!steps.length && !errors.length) errors.push('This proposal would not change anything.')
  return { steps, warnings: [...new Set(warnings)], errors }
}

export type SetupOutcome = { ok: boolean; done: string[]; failed?: string; error?: string }

/** Runs a plan's steps in order and stops at the first that fails, reporting what was done before it */
export const runPlan = async (scope: MedusaContainer, plan: SetupPlan): Promise<SetupOutcome> => {
  const done: string[] = []
  for (const step of plan.steps) {
    try {
      await step.run(scope)
      done.push(step.line)
    } catch (error) {
      return { ok: false, done, failed: step.line, error: error instanceof Error ? error.message : String(error) }
    }
  }
  return { ok: true, done }
}
