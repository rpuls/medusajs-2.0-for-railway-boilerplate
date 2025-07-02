# Volaron Medusa MCP Server

This is a Model Context Protocol (MCP) server that enables AI assistants to interact with the Medusa backend.

## 🚀 Features

- **Product Management**: List, create, update, and delete products
- **Order Management**: View orders, update status, process returns
- **Customer Management**: List customers, view purchase history
- **Analytics**: Sales statistics, product analysis, customer trends
- **Health Check**: Production-ready health endpoint

## 📋 Prerequisites

- Node.js v18 or higher
- Access to Medusa Backend
- Medusa API Key

## 🔧 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Development mode:**
   ```bash
   npm run dev
   ```

## 🐳 Docker

```bash
# Build image
docker build -t volaron-mcp .

# Run container
docker run -p 3000:3000 \
  -e MEDUSA_BACKEND_URL=https://your-backend.com \
  -e MEDUSA_API_KEY=your-key \
  volaron-mcp
```

## 🚀 Railway Deployment

This service is configured to deploy on Railway automatically:

1. Environment variables are set in Railway dashboard
2. Health check endpoint: `/health`
3. Automatic restarts on failure

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MEDUSA_BACKEND_URL` | Medusa backend URL | Required |
| `MEDUSA_API_KEY` | API key for authentication | Required |
| `MCP_PORT` | Server port | 3000 |
| `MCP_HOST` | Server host | 0.0.0.0 |
| `MCP_SECRET_KEY` | Secret for MCP auth | Required |
| `NODE_ENV` | Environment | development |

## 🔌 Claude Desktop Integration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "volaron-medusa": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "MEDUSA_BACKEND_URL": "your-url",
        "MEDUSA_API_KEY": "your-key"
      }
    }
  }
}
```

## 📝 Available Commands

- `list products` - Show all products
- `create product [name]` - Create new product
- `update stock [product-id] [quantity]` - Update inventory
- `show orders` - List recent orders
- `customer info [email]` - Get customer details

## 🛠️ Development

### Project Structure

```
services/medusa-mcp/
├── src/
│   ├── index.ts           # Main entry point
│   ├── services/          # Service implementations
│   └── types/             # TypeScript types
├── config/                # Configuration files
├── dist/                  # Compiled output
└── package.json
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit PR

## 📄 License

MIT