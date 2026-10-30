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
| Read orders, and customers limited to name, email, country and order history | Change prices or stock on published products |
| Read sales summaries | Refund, cancel or edit orders |
| Create new products as drafts, and edit products while they are drafts | See addresses, phone numbers or payment details, or export customers |
| Suggest changes to published products, which wait for you to apply them | Change store settings, users or API keys |

The rule underneath: anything a shopper could see changes only when an admin
does it in the dashboard. A draft is invisible to shoppers until you publish it,
and publishing is not a tool. A change to a published product is saved as a
suggestion, shown on that product's page in the admin with the current and the
suggested text side by side, and applied only when you click **Apply**. No tool
returns more than 50 rows, so none of them works as a bulk export.

### Tools

| Tool | What it does |
| --- | --- |
| `get_store_overview` | Store name, currencies, regions, sales channels, categories, collections, product counts, orders in the last 30 days |
| `search_products` | Products by text, status or category, with price ranges |
| `get_product` | One product in full, every variant with prices and available stock |
| `list_low_stock` | Variants at or below a stock threshold |
| `list_orders` | Orders by date, status or customer email |
| `get_order` | One order with line items and totals; the address is reduced to its country |
| `get_sales_summary` | Revenue, orders and average order value per currency, best sellers, orders per day |
| `search_customers` | Customers by name or email, with country and order count |
| `get_customer` | One customer with total spent and their latest orders |
| `create_product_draft` | A new product with options, variants and prices, always as a draft |
| `update_product_draft` | Texts, images, categories and variant prices of a draft; refused for anything else |
| `suggest_product_changes` | A new title, subtitle, description or categories for any product, for an admin to review |
| `list_product_suggestions` | The suggestions made through this connection and what became of them |

Prices and totals are in major currency units: `19.99` means 19.99 euros, not
cents. Stock on a drafted product is left for you to set before you publish it.

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

Everything lives in five Postgres tables (`store_mcp_*`) created by the normal
migrations, so connections survive restarts and redeploys and no Redis is
needed. The MCP endpoint is stateless: each request carries its token and gets
a fresh server.

Limits are kept in memory: 10 registrations per 10 minutes and 60 token
requests a minute per IP address, 5 failed sign-ins per email and 20 per IP
address per 15 minutes, and 120 MCP calls a minute per connection. Running
several backend replicas multiplies them.

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
   `backend/src/admin/widgets/product-ai-suggestions.tsx` and
   `backend/src/admin/lib/store-mcp.ts`.
2. Remove the `./src/modules/store-mcp` entry from `backend/medusa-config.js`
   and the `.well-known` entry from `backend/src/api/middlewares.ts`.
3. Remove `@modelcontextprotocol/sdk` from `backend/package.json`.
4. Delete `storefront/qa/17-store-mcp.spec.ts`.

The `store_mcp_*` tables stay behind until you drop them.
