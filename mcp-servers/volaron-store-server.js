const { Server } = require("@modelcontextprotocol/sdk/server/index.js")
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js")
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js")

class VolaronStoreServer {
  constructor() {
    this.server = new Server(
      {
        name: "volaron-store-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.setupToolHandlers()
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_products",
            description: "Obter lista de produtos da loja Volaron",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Número máximo de produtos a retornar",
                  default: 10,
                },
                category: {
                  type: "string",
                  description: "Filtrar por categoria",
                },
              },
            },
          },
          {
            name: "create_product",
            description: "Criar novo produto na loja",
            inputSchema: {
              type: "object",
              properties: {
                title: { type: "string", description: "Nome do produto" },
                description: { type: "string", description: "Descrição do produto" },
                price: { type: "number", description: "Preço do produto" },
                category: { type: "string", description: "Categoria do produto" },
              },
              required: ["title", "description", "price"],
            },
          },
          {
            name: "get_orders",
            description: "Obter pedidos da loja",
            inputSchema: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  description: "Filtrar por status do pedido",
                },
                limit: {
                  type: "number",
                  description: "Número máximo de pedidos",
                  default: 20,
                },
              },
            },
          },
          {
            name: "update_inventory",
            description: "Atualizar estoque de produto",
            inputSchema: {
              type: "object",
              properties: {
                productId: { type: "string", description: "ID do produto" },
                quantity: { type: "number", description: "Nova quantidade em estoque" },
              },
              required: ["productId", "quantity"],
            },
          },
        ],
      }
    })

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case "get_products":
            return await this.getProducts(args)
          case "create_product":
            return await this.createProduct(args)
          case "get_orders":
            return await this.getOrders(args)
          case "update_inventory":
            return await this.updateInventory(args)
          default:
            throw new Error(`Ferramenta desconhecida: ${name}`)
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Erro ao executar ${name}: ${error.message}`,
            },
          ],
          isError: true,
        }
      }
    })
  }

  async getProducts(args) {
    const { limit = 10, category } = args

    try {
      const baseUrl = process.env.MEDUSA_BACKEND_URL || "https://backend-production-c461d.up.railway.app"
      const url = new URL(`${baseUrl}/store/products`)

      if (category) {
        url.searchParams.append("category_id", category)
      }
      url.searchParams.append("limit", limit.toString())

      const response = await fetch(url.toString())
      const data = await response.json()

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                products: data.products || [],
                count: data.count || 0,
                message: `Encontrados ${data.count || 0} produtos`,
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error.message,
                message: "Erro ao buscar produtos",
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  }

  async createProduct(args) {
    const { title, description, price, category } = args

    try {
      const baseUrl = process.env.MEDUSA_BACKEND_URL || "https://backend-production-c461d.up.railway.app"
      const response = await fetch(`${baseUrl}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MEDUSA_ADMIN_TOKEN || ""}`,
        },
        body: JSON.stringify({
          title,
          description,
          variants: [
            {
              title: "Default",
              prices: [
                {
                  currency_code: "brl",
                  amount: Math.round(price * 100),
                },
              ],
            },
          ],
          categories: category ? [{ id: category }] : [],
        }),
      })

      const data = await response.json()

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: response.ok,
                product: data.product || null,
                message: response.ok ? "Produto criado com sucesso" : "Erro ao criar produto",
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error.message,
                message: "Erro ao criar produto",
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  }

  async getOrders(args) {
    const { status, limit = 20 } = args

    try {
      const baseUrl = process.env.MEDUSA_BACKEND_URL || "https://backend-production-c461d.up.railway.app"
      const url = new URL(`${baseUrl}/admin/orders`)

      if (status) {
        url.searchParams.append("status", status)
      }
      url.searchParams.append("limit", limit.toString())

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${process.env.MEDUSA_ADMIN_TOKEN || ""}`,
        },
      })

      const data = await response.json()

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                orders: data.orders || [],
                count: data.count || 0,
                message: `Encontrados ${data.count || 0} pedidos`,
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error.message,
                message: "Erro ao buscar pedidos",
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  }

  async updateInventory(args) {
    const { productId, quantity } = args

    try {
      const baseUrl = process.env.MEDUSA_BACKEND_URL || "https://backend-production-c461d.up.railway.app"

      // Primeiro, obter as variantes do produto
      const productResponse = await fetch(`${baseUrl}/admin/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MEDUSA_ADMIN_TOKEN || ""}`,
        },
      })

      const productData = await productResponse.json()
      const variants = productData.product?.variants || []

      if (variants.length === 0) {
        throw new Error("Produto não encontrado ou sem variantes")
      }

      // Atualizar estoque da primeira variante
      const variantId = variants[0].id
      const response = await fetch(`${baseUrl}/admin/variants/${variantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MEDUSA_ADMIN_TOKEN || ""}`,
        },
        body: JSON.stringify({
          inventory_quantity: quantity,
        }),
      })

      const data = await response.json()

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: response.ok,
                variant: data.variant || null,
                message: response.ok ? `Estoque atualizado para ${quantity}` : "Erro ao atualizar estoque",
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error.message,
                message: "Erro ao atualizar estoque",
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.log("Volaron Store MCP Server rodando...")
  }
}

if (require.main === module) {
  const server = new VolaronStoreServer()
  server.run().catch(console.error)
}

module.exports = VolaronStoreServer
