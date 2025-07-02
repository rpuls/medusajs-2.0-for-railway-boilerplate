# Medusa MCP Deployment Guide

## 🚀 Railway Deployment

### Automatic Deployment

The MCP service is configured for automatic deployment on Railway:

1. **Add New Service in Railway:**
   - Go to your Railway project dashboard
   - Click "New Service" → "GitHub Repo"
   - Select the same repository: `exzosdigital/exzosvega`
   - Set **Root Directory**: `/services/medusa-mcp`

2. **Configure Environment Variables:**
   ```
   MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app
   MEDUSA_API_KEY=sk_b2389038ddd51fe845f03eba040b03180b1cac1da1c5162b4eeb1fa985a554bb
   MCP_PORT=3000
   MCP_HOST=0.0.0.0
   MCP_SECRET_KEY=volaron_mcp_secret_2025
   NODE_ENV=production
   ```

3. **Wait for Build & Deploy:**
   - Railway will detect the Dockerfile
   - Build process takes ~2-3 minutes
   - Health check endpoint: `/health`

### Manual Railway CLI Deployment

```bash
# From services/medusa-mcp directory
railway link
railway service create medusa-mcp-server
railway variables add MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app
railway variables add MEDUSA_API_KEY=sk_b2389038ddd51fe845f03eba040b03180b1cac1da1c5162b4eeb1fa985a554bb
railway variables add MCP_PORT=3000
railway variables add MCP_HOST=0.0.0.0
railway variables add MCP_SECRET_KEY=volaron_mcp_secret_2025
railway up
```

## 🔧 Local Development

### Quick Start

```bash
# Navigate to MCP directory
cd services/medusa-mcp

# Run setup script
chmod +x setup.sh
./setup.sh

# Edit .env file with your values
nano .env

# Start development server
npm run dev
```

### Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Build project:**
   ```bash
   npm run build
   ```

4. **Start server:**
   ```bash
   npm start
   ```

## 🔌 Claude Desktop Integration

### Local MCP Server

```json
{
  "mcpServers": {
    "volaron-medusa-local": {
      "command": "node",
      "args": ["/path/to/services/medusa-mcp/dist/index.js"],
      "env": {
        "MEDUSA_BACKEND_URL": "https://backend-production-c461d.up.railway.app",
        "MEDUSA_API_KEY": "sk_b2389038ddd51fe845f03eba040b03180b1cac1da1c5162b4eeb1fa985a554bb"
      }
    }
  }
}
```

### Remote MCP Server (After Railway Deploy)

```json
{
  "mcpServers": {
    "volaron-medusa-remote": {
      "url": "https://medusa-mcp-server-production-xxxx.up.railway.app",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer volaron_mcp_secret_2025"
      }
    }
  }
}
```

## 📊 Monitoring

- **Health Check**: `https://your-mcp-url.railway.app/health`
- **Railway Logs**: Available in Railway dashboard
- **Local Logs**: Check console output

## 🆘 Troubleshooting

### Common Issues

1. **"Cannot find module" errors:**
   ```bash
   rm -rf node_modules
   npm install
   npm run build
   ```

2. **"API Key invalid" errors:**
   - Verify API key in Medusa Admin
   - Check environment variables in Railway

3. **Health check failing:**
   - Ensure PORT is set correctly
   - Check Dockerfile exposes correct port

## 🔐 Security Notes

- Never commit `.env` files
- Rotate API keys regularly
- Use strong MCP_SECRET_KEY
- Enable Railway's built-in DDoS protection