import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as dotenv from "dotenv";
import express from "express";

// Load environment variables
dotenv.config();

async function main(): Promise<void> {
    console.error("Starting Volaron Medusa MCP Server...");
    console.error(`Connecting to: ${process.env.MEDUSA_BACKEND_URL}`);
    
    // Initialize MCP Server
    const server = new McpServer(
        {
            name: "Volaron Medusa MCP Server",
            version: "1.0.0"
        },
        {
            capabilities: {
                tools: {}
            }
        }
    );

    // Health check endpoint for Railway
    if (process.env.NODE_ENV === 'production') {
        const app = express();
        
        app.get('/health', (req, res) => {
            res.status(200).json({ 
                status: 'healthy',
                service: 'medusa-mcp-server',
                timestamp: new Date().toISOString(),
                environment: {
                    medusa_url: process.env.MEDUSA_BACKEND_URL,
                    has_publishable_key: !!process.env.PUBLISHABLE_KEY,
                    has_username: !!process.env.MEDUSA_USERNAME
                }
            });
        });
        
        const port = process.env.PORT || 3000;
        app.listen(port, '0.0.0.0', () => {
            console.error(`Health check server running on port ${port}`);
        });
    }

    // Setup MCP transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("MCP Server connected successfully");
}

main().catch((error) => {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
});
