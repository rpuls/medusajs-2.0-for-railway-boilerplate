import express from "express";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main(): Promise<void> {
    console.log("Starting Volaron Medusa MCP Server...");
    console.log(`Connecting to: ${process.env.MEDUSA_BACKEND_URL}`);
    
    // Health check endpoint for Railway
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
    
    app.get('/', (req, res) => {
        res.json({ 
            message: 'Volaron Medusa MCP Server',
            status: 'running',
            version: '1.0.0'
        });
    });
    
    const port = parseInt(process.env.PORT || '3000', 10);
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
    });
}

main().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
