# The store MCP server

Every store deployed from this template has an MCP server at
`https://<your-backend>/mcp`. MCP (Model Context Protocol) is how AI assistants
such as ChatGPT and Claude use outside tools, so this is what lets one of them
look at your orders, check stock or draft products, signed in as you.

This is part of this template, not a Medusa product. It is built on Medusa's
public module, workflow and API route features, and the code is in
[backend/src/store-mcp](../backend/src/store-mcp).

## Connect an assistant

1. In the admin, open **AI assistants** and copy the server URL.
2. Add it to the assistant:
   - **ChatGPT:** turn on developer mode in the settings, then create an app or
     connector with the URL and OAuth as the authentication.
   - **Claude:** add a custom connector with the URL.
   - **Any other MCP client** that supports remote servers over Streamable HTTP
     with OAuth: add the URL as a remote server.
3. The assistant opens a page on your backend. Sign in with your admin email
   and password (or, if you are already signed in to the dashboard in that
   browser, just confirm), read what it may do, and click **Allow**.

It now acts as you, through the tools below and nothing else. The connection
shows up under **Connected apps** on the AI assistants page, where **Disconnect**
ends it on the assistant's next call.

## What it can and cannot do

| It can | It cannot |
| --- | --- |
| Read products, variants, prices, stock levels, categories and collections | Publish, unpublish or delete anything |
| Read orders, and customers limited to name, email, country and order history | Change prices on published products |
| Read sales summaries | Refund, cancel or edit orders |
| Create new products as drafts, with their stock, and edit products while they are drafts | See addresses, phone numbers or payment details, or export customers |
| Suggest changes to published products, which wait for you to apply them | Change stock, warehouses, regions, shipping, taxes or other settings itself, or users and API keys |
| Propose stock, warehouses, regions, shipping and tax rates, which wait for you to apply them | |

The rule underneath: anything a shopper could see changes only when an admin
does it in the dashboard. A draft is invisible to shoppers until you publish it,
and publishing is not a tool. A change to a published product is saved as a
suggestion, shown on that product's page in the admin with the current and the
suggested text side by side, and applied only when you click **Apply**. Stock on
a published product, warehouses, regions, shipping and tax rates work the same
way, as a [proposal](#proposals-stock-warehouses-regions-shipping-and-tax). No tool
returns more than 50 rows, paging through orders and customers stops after 250,
and requests that bundle several calls are refused, so none of them works as a
bulk export.

Images on a draft must already be in the store's own file storage, for example
an image another product uses. An assistant cannot point a product at an image
elsewhere: a URL it chose would be loaded by the dashboard, and that is a way to
smuggle data out if someone has planted instructions in, say, a customer name.
Add other images yourself in the dashboard.

### Tools

| Tool | What it does |
| --- | --- |
| `get_store_overview` | Store name, currencies, regions, sales channels, categories, collections, product counts, orders in the last 30 days |
| `search_products` | Products by text, status or category, with price ranges |
| `get_product` | One product in full, every variant with prices and its stock in total and per warehouse |
| `list_low_stock` | Variants at or below a stock threshold |
| `list_orders` | Orders by date, status or customer email |
| `get_order` | One order with line items and totals; the address is reduced to its country |
| `get_sales_summary` | Revenue, orders and average order value per currency, best sellers, orders per day |
| `search_customers` | Customers by name or email, with country and order count |
| `get_customer` | One customer with total spent and their latest orders |
| `create_product_draft` | A new product with options, variants, prices and stock, always as a draft |
| `update_product_draft` | Texts, images, categories, variant prices and variant stock of a draft; refused for anything else |
| `suggest_product_changes` | A new title, subtitle, description or categories for any product, for an admin to review |
| `list_product_suggestions` | The suggestions made through this connection and what became of them |
| `get_store_setup` | Currencies, regions with their countries and payment methods, shipping zones and options, tax rates, and this connection's setup proposals |
| `propose_store_setup` | New regions, countries added to regions, tax rates, warehouses, shipping zones, shipping options and shipping profiles, products moved into a profile, and stock, as one proposal for an admin to apply |
| `propose_stock_changes` | A stock count or a delivery for any product, per variant and warehouse, as a proposal for an admin to apply |

Prices and totals are in major currency units: `19.99` means 19.99 euros, not
cents. Stock on a drafted product is left for you to set before you publish it.

### Prompts

Ready-made tasks, which clients that support MCP prompts offer as a menu or
slash commands. They are only prompts: they use the tools above with the same
limits.

| Prompt | What it asks for |
| --- | --- |
| `store_report` | Sales against the period before, best sellers, low stock, three suggestions |
| `restock_check` | Low-stock variants ranked by how fast they sell |
| `improve_product` | A better title, subtitle and description for one product, saved as a suggestion |
| `draft_product` | A complete product draft from a rough description |
| `sell_to_country` | The region, shipping and tax rate for a new country, as one setup proposal |
| `ship_separately` | A shipping profile with its own shipping options for products that ship differently, as one setup proposal |

### Stock

Medusa tracks stock per variant and per warehouse (a stock location). A variant
can be bought when it has stock at a warehouse that sells through the store's
sales channel and ships to the shopper. A new variant has none anywhere, which
is why a new product shows as sold out until someone adds a warehouse to each
variant in the dashboard and only then a number.

An assistant sets stock on a draft directly, in `create_product_draft` or
`update_product_draft`, at the store's default warehouse unless told
otherwise, because a draft is not live: "draft a linen shirt in S, M and L, 20
of each" gives you a product that can be bought the moment you publish it. On a
published product it proposes stock with `propose_stock_changes`, either as a
count ("set to 40") or as a delivery ("add 20"). A delivery is counted from the
stock at the moment you apply it, so units sold in between are not lost.

### Proposals: stock, warehouses, regions, shipping and tax

Setting up a new country means a region, a way to ship there and a tax rate,
spread over three settings pages. An assistant can do the tedious part: ask it
to "start selling to the Netherlands" (or use the `sell_to_country` prompt) and
it reads the current setup and sends one proposal, which can:

- create warehouses, which sell through the default sales channel and ship
  with the same providers as the default one, and give them shipping zones;
- set stock, per variant and warehouse;
- create regions, or add countries to an existing region;
- set the standard tax rate of a country;
- create shipping zones with their shipping options, add countries to an
  existing zone, or add shipping options to one;
- create shipping profiles, for products that ship differently (bulky items
  by freight, say), give them their own shipping options, and move up to 50
  products into them.

None of this has a draft state, because a region or a shipping option is live
at checkout the moment it exists. So nothing changes when the assistant
proposes. The backend checks the proposal against the store and turns it into
plain sentences ("Add Netherlands to region "Europe" (EUR)."), with warnings for
what would still be missing: a country no shipping zone covers, a shipping
option without a price in the region's currency, products without a price in a
new region's currency, a country with no tax rate, a shipping profile whose
products cannot reach every country the store sells to, stock at a warehouse
that does not sell through the product's sales channel or ships nowhere. A
proposal that cannot work,
such as a country that is already in another region, is refused before it is
saved.

The proposal waits on the **AI assistants** page, and on the **Regions** list in
Settings. **Apply** plans it again against the store as it is at that moment,
so what you read is what runs, and an outdated proposal says why it can no
longer be applied. A new region gets the payment methods your existing regions
have. A proposal never deletes anything, never takes a country out of a region
or a shipping zone, and never changes an existing shipping price. The existing
values it can change are stock levels, a country's standard tax rate and the
shipping profile of the products it moves. Check the tax
rates it proposes: the assistant knows the standard rates, not your tax
obligations.

## How the sign-in works

The backend is its own OAuth 2.1 authorization server, following the MCP
authorization spec:

- **Discovery.** `/mcp` answers an anonymous request with a `401` that points
  at `/.well-known/oauth-protected-resource/mcp`, which names the backend as
  the authorization server, whose metadata is at
  `/.well-known/oauth-authorization-server`.
- **Registration.** Apps register themselves at `/oauth/register` (RFC 7591),
  or identify themselves with a client ID metadata document URL, which the
  backend fetches with SSRF protection. Registering grants nothing.
- **Consent.** `/oauth/authorize` shows who is asking, what they may do and
  where you will be sent back to. Authorization codes require PKCE (S256), are
  single use, expire after five minutes and carry `iss` (RFC 9207).
- **Tokens.** Access tokens last an hour, refresh tokens thirty days and rotate
  on every use. Only SHA-256 hashes are stored, so a database dump contains no
  working token. A replayed code or a reused refresh token revokes the whole
  grant, because it means something leaked.
- **Two-step verification.** An admin account with MFA cannot connect with its
  password alone. Sign in to the dashboard first, completing MFA there, and the
  consent page then accepts that session.

Everything lives in six Postgres tables (`store_mcp_*`) created by the normal
migrations, so connections survive restarts and redeploys and no Redis is
needed. The MCP endpoint is stateless: each request carries its token and gets
a fresh server.

Limits are kept in memory: 10 app registrations per 10 minutes per IP address
and 200 an hour overall, 60 consent page views and 60 token requests a minute
per IP address, 5 failed sign-ins per email and 20 per IP address per 15
minutes, and 120 MCP calls a minute per connection. Apps that registered but
were never approved are deleted after a day. Running several backend replicas
multiplies the limits.

A sign-in link that is malformed shows an error page rather than sending the
visitor back to the app, because anyone can register an app with any redirect
address, and an automatic redirect would let a link on the store's own domain
bounce visitors to a site of someone else's choosing.

The deploy log records connections, approvals and revocations by admin id and
app name. It never records a token, a code, a password or a client secret.

## Settings

| Variable | Effect |
| --- | --- |
| `STORE_MCP_ENABLED` | `false` turns every endpoint above into a 404. Connections are kept and work again when it is turned back on. |
| `BACKEND_PUBLIC_URL` | The public URL the server and its OAuth metadata use. Railway sets the default from the service's domain; set this if the backend runs on your own domain. |

Nothing else is configured. The server signs its consent form with a key
derived from `JWT_SECRET`, so changing `JWT_SECRET` only invalidates consent
pages that are open at that moment.

## Removing it

1. Delete `backend/src/store-mcp`, `backend/src/modules/store-mcp`,
   `backend/src/api/mcp`, `backend/src/api/oauth`,
   `backend/src/api/admin/store-mcp`, `backend/src/admin/routes/ai-assistants`,
   `backend/src/admin/widgets/product-ai-suggestions.tsx`,
   `backend/src/admin/widgets/region-setup-proposals.tsx`,
   `backend/src/admin/components/setup-proposals.tsx` and
   `backend/src/admin/lib/store-mcp.ts`.
2. Remove the `./src/modules/store-mcp` entry from `backend/medusa-config.js`
   and the `.well-known` entry from `backend/src/api/middlewares.ts`.
3. Remove `@modelcontextprotocol/sdk` from `backend/package.json`.
4. Delete `storefront/qa/17-store-mcp.spec.ts`.

The `store_mcp_*` tables stay behind until you drop them.
