import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import MedusaStoreService from "./services/medusa-store";
import MedusaAdminService from "./services/medusa-admin";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main(): Promise<void> {
    console.error("Starting Volaron Medusa MCP Server...");
    console.error(`Connecting to: ${process.env.MEDUSA_BACKEND_URL}`);
    
    const medusaStoreService = new MedusaStoreService();
    const medusaAdminService = new MedusaAdminService();
    let tools = [];
    
    try {
        await medusaAdminService.init();

        tools = [
            ...medusaStoreService.defineTools(),
            ...medusaAdminService.defineTools()
        ];
        console.error("Successfully initialized admin and store services");
    } catch (error) {
        console.error("Error initializing Medusa Admin Services:", error);
        console.error("Running with store services only");
        tools = [...medusaStoreService.defineTools()];
    }

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

    // Health check endpoint
    if (process.env.NODE_ENV === 'production') {
        const express = require('express');
        const app = express();
        
        app.get('/health', (req, res) => {
            res.status(200).json({ 
                status: 'healthy',
                service: 'volaron-medusa-mcp',
                medusa_url: process.env.MEDUSA_BACKEND_URL,
                timestamp: new Date().toISOString()
            });
        });
        
        const PORT = process.env.PORT || process.env.MCP_PORT || 3000;
        app.listen(PORT, () => {
            console.error(`Health check endpoint running on port ${PORT}`);
        });
    }

    tools.forEach((tool) => {
        server.tool(
            tool.name,
            tool.description,
            tool.inputSchema,
            tool.handler
        );
    });

    const transport = new StdioServerTransport();
    console.error("Connecting server to transport...");
    await server.connect(transport);

    console.error("Volaron Medusa MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});