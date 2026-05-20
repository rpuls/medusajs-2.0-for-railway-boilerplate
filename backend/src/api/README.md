# Custom API Routes

An API Route is a REST API endpoint.

An API Route is created in a TypeScript or JavaScript file under the `/src/api` directory of your Medusa application. The file’s name must be `route.ts` or `route.js`.

For example, to create a `GET` API Route at `/store/hello-world`, create the file `src/api/store/hello-world/route.ts` with the following content:

```ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    message: "Hello world!",
  });
}
```

## Supported HTTP methods

The file based routing supports the following HTTP methods:

- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS
- HEAD

You can define a handler for each of these methods by exporting a function with the name of the method in the paths `route.ts` file.

For example:

```ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Handle GET requests
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // Handle POST requests
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  // Handle PUT requests
}
```

## Parameters

To create an API route that accepts a path parameter, create a directory within the route's path whose name is of the format `[param]`.

For example, if you want to define a route that takes a `productId` parameter, you can do so by creating a file called `/api/products/[productId]/route.ts`:

```ts
import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/medusa"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { productId } = req.params;

  res.json({
    message: `You're looking for product ${productId}`
  })
}
```

To create an API route that accepts multiple path parameters, create within the file's path multiple directories whose names are of the format `[param]`.

For example, if you want to define a route that takes both a `productId` and a `variantId` parameter, you can do so by creating a file called `/api/products/[productId]/variants/[variantId]/route.ts`.

## Using the container

The Medusa container is available on `req.scope`. Use it to access modules' main services and other registered resources:

```ts
import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/medusa"
import { IProductModuleService } from "@medusajs/types"
import { ModuleRegistrationName } from "@medusajs/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const productModuleService: IProductModuleService =
    req.scope.resolve(ModuleRegistrationName.PRODUCT)

  const [, count] = await productModuleService.listAndCount()

  res.json({
    count,
  })
}
```

## Middleware

You can apply middleware to your routes by creating a file called `/api/middlewares.ts`. This file must export a configuration object with what middleware you want to apply to which routes.

For example, if you want to apply a custom middleware function to the `/store/custom` route, you can do so by adding the following to your `/api/middlewares.ts` file:

```ts
import type {
  MiddlewaresConfig,
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/medusa";

async function logger(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  console.log("Request received");
  next();
}

export const config: MiddlewaresConfig = {
  routes: [
    {
      matcher: "/store/custom",
      middlewares: [logger],
    },
  ],
};
```

The `matcher` property can be either a string or a regular expression. The `middlewares` property accepts an array of middleware functions.

## Shipping

The storefront uses a hybrid shipping model: light AU carts get manual flat
rates, heavier carts get live ShipStation quotes. The threshold and webhook
flow are wired through three custom routes plus a few env vars.

### Threshold env vars

| Var | Default | Purpose |
| --- | --- | --- |
| `SHIPPING_FLAT_RATE_MAX_GRAMS` | `3000` | Anything ≤ this weight (incl. packaging overhead) gets the manual flat-rate tier. Above it, only ShipStation calculated rates are returned. |
| `SHIPPING_PACKAGING_OVERHEAD_GRAMS` | `150` | Constant added to every cart's `Σ(item.weight × quantity)` before tier evaluation and before the weight is forwarded to ShipStation. |
| `SHIPSTATION_API_KEY` | — | When unset the ShipStation provider is not registered; only manual flat rates are seeded/served. |
| `SHIPSTATION_WEBHOOK_SECRET` | — | HMAC-SHA256 secret used to verify incoming webhook payloads. Required for `/hooks/shipstation`. |
| `SHIPSTATION_WAREHOUSE_*` | — | Origin (ship-from) defaults used when a Medusa stock location is missing fields (`POSTCODE`, `COUNTRY_CODE`, `CITY`, `STATE`, `NAME`, `ADDRESS_1`, `PHONE`). |

### Storefront shipping endpoint

`GET /store/cart-shipping-options?cart_id=<id>`

1. Resolves the cart and computes
   `total_weight_grams = Σ(item.weight × quantity) + SHIPPING_PACKAGING_OVERHEAD_GRAMS`.
2. Loads every shipping option Medusa would normally return for the cart via
   `listShippingOptionsForCartWorkflow`.
3. If `total ≤ SHIPPING_FLAT_RATE_MAX_GRAMS` → returns only options whose
   `provider_id` starts with `manual_`. Otherwise returns only options whose
   `provider_id` starts with `shipstation_`. Falls back to the unfiltered list
   if filtering would empty the response (avoids checkout dead-ends).
4. Response shape:
   ```json
   {
     "shipping_options": [/* StoreCartShippingOption[] */],
     "total_weight_grams": 2750,
     "items_weight_grams": 2600,
     "packaging_overhead_grams": 150,
     "threshold_grams": 3000,
     "items_missing_weight": 0,
     "tier": "flat"
   }
   ```

### ShipStation webhook

`POST /hooks/shipstation`

Register this URL in the ShipStation v2 dashboard and subscribe to at least
the `shipment_shipped` event (we also handle `tracking_updated`,
`shipment_voided`, and `label_voided`). The route:

1. Verifies the `X-SHIPSTATION-WEBHOOK-SIGNATURE` header against the raw
   request body using `SHIPSTATION_WEBHOOK_SECRET` (HMAC-SHA256, base64). The
   route is registered with `bodyParser.preserveRawBody: true` in
   `src/api/middlewares.ts`.
2. Pulls the full shipment + label set from ShipStation using the
   `external_order_id` / `external_shipment_id` we attached when
   `createFulfillment` was invoked, and de-duplicates by `label_id`.
3. Persists the parcels onto the matching Medusa fulfillment as
   `metadata.parcels` and mirrors them onto `metadata.tracking_links` for
   compatibility.
4. Triggers `createOrderShipmentWorkflow` so Medusa emits
   `order.shipment_created`, which the `order-shipment-created` subscriber
   uses to send the per-parcel `ORDER_SHIPPED` dispatch email.

### Expected `parcels` metadata shape

`fulfillment.metadata.parcels` is an array — one entry per ShipStation label.
The same shape is consumed by both the dispatch email template and the
storefront's `TrackingList`.

```json
[
  {
    "label_id": "se-1234567890",
    "shipment_id": "se-9876543210",
    "tracking_number": "ABC123",
    "tracking_url": "https://auspost.com.au/mypost/track/#/details/ABC123",
    "carrier_id": "se_australia_post",
    "carrier_code": "auspost",
    "service_code": "auspost_parcel_post",
    "package_code": null,
    "label_url": "https://api.shipstation.com/v2/downloads/.../label.pdf",
    "weight_grams": 1100,
    "voided_at": null,
    "shipped_at": "2026-04-27T10:30:00.000Z"
  }
]
```

### Admin visibility

Two read-only widgets surface the shipping picture on the Admin Order page:

- **Shipping decision** (sidebar, `order.details.side.after`) reads
  `order.metadata.shipping_decision` and renders the chosen tier
  (Flat-rate vs Live ShipStation quote), cart weight at checkout, the
  threshold, ship-from postcode/country, and `computed_at`. The blob is
  written by `/store/cart-shipping-options` onto the cart on every poll, and a
  defensive `order.placed` subscriber
  (`src/subscribers/order-placed-stamp-shipping-decision.ts`) mirrors it onto
  the order if the core completion flow doesn't carry cart metadata across.
  Older orders predating this rollout simply show an empty state.
- **ShipStation parcels** (full-width, `order.details.after`) re-fetches the
  order with `+fulfillments.metadata` and renders one table per fulfillment:
  carrier · service, tracking number + Track link, per-parcel weight, label
  PDF link, and a Voided / Shipped / Pending status pill. Falls back to native
  `fulfillment.labels[]` when `metadata.parcels` is absent so manual flat-rate
  fulfillments still render usefully.

Both widgets are view-only; reprint and void label actions are intentionally
out of scope. Edit shipping data via ShipStation itself — the webhook will
sync changes back into `metadata.parcels` on the next event.

### Smoke test

Validate the threshold logic without booting the storefront:

```bash
cd backend
npx medusa exec ./src/scripts/test-shipping-tier.ts
```

The script synthesises three carts (~2.5 kg, ~3.5 kg, and exactly at the
threshold) and prints the resolved `tier` for each so you can see the
hybrid logic decide flat vs. live.
