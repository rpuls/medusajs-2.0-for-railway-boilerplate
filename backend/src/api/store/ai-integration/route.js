import axios from "axios";
import { OLLAMA_API_URL, AI_MODEL, N8N_WEBHOOK_URL, N8N_API_KEY } from "../../../lib/n8n-constants.js";

export default async function handler(req, res) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle CORS
  if (req.method === "OPTIONS") {
    return res.status(200).set(corsHeaders).end();
  }

  try {
    const { productService } = req.scope.resolve("productService");
    const { orderService } = req.scope.resolve("orderService");
    const { customerService } = req.scope.resolve("customerService");
    
    switch (req.method) {
      case "POST":
        const { action, data } = req.body;
        
        switch (action) {
          case "generate-product-description":
            const product = await productService.retrieve(data.productId);
            
            // Generate description with AI
            const aiResponse = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
              model: AI_MODEL,
              prompt: `Create an SEO-optimized product description for: ${product.title}. 
                       Category: ${product.type}. 
                       Tags: ${product.tags?.map(t => t.value).join(", ")}.
                       Make it compelling, detailed, and focused on benefits.`,
              stream: false,
            });
            
            const description = aiResponse.data.response;
            
            // Update product
            await productService.update(product.id, { description });
            
            // Notify N8N
            await axios.post(`${N8N_WEBHOOK_URL}/webhook/ai-description-generated`, {
              productId: product.id,
              description,
            });
            
            return res.status(200).json({ 
              success: true, 
              productId: product.id,
              description 
            });
            
          case "analyze-sales-trends":
            const orders = await orderService.list({
              created_at: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            });
            
            // Prepare data for AI analysis
            const salesData = orders.map(order => ({
              date: order.created_at,
              total: order.total,
              items: order.items.length,
              customer_id: order.customer_id,
            }));
            
            const analysisResponse = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
              model: AI_MODEL,
              prompt: `Analyze these sales trends and provide insights: ${JSON.stringify(salesData)}. 
                       Include: 1) Key patterns, 2) Best selling times, 3) Customer behavior, 4) Recommendations`,
              stream: false,
            });
            
            return res.status(200).json({ 
              success: true, 
              analysis: analysisResponse.data.response,
              data: salesData 
            });
            
          case "personalize-recommendations":
            const customer = await customerService.retrieve(data.customerId, {
              relations: ["orders", "orders.items", "orders.items.variant", "orders.items.variant.product"],
            });
            
            const purchaseHistory = customer.orders?.map(order => 
              order.items.map(item => ({
                product: item.variant.product.title,
                category: item.variant.product.type,
                price: item.unit_price,
              }))
            ).flat();
            
            const recommendationResponse = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
              model: AI_MODEL,
              prompt: `Based on this purchase history: ${JSON.stringify(purchaseHistory)}, 
                       recommend 5 products they might like. Consider patterns, preferences, and complementary items.`,
              stream: false,
            });
            
            return res.status(200).json({ 
              success: true, 
              customerId: customer.id,
              recommendations: recommendationResponse.data.response 
            });
            
          case "generate-marketing-content":
            const { type, context } = data;
            
            const contentResponse = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
              model: AI_MODEL,
              prompt: `Generate ${type} content for: ${context}. 
                       Make it engaging, on-brand, and optimized for conversions.`,
              stream: false,
            });
            
            // Trigger N8N workflow for content approval
            await axios.post(`${N8N_WEBHOOK_URL}/webhook/content-generated`, {
              type,
              content: contentResponse.data.response,
              context,
            });
            
            return res.status(200).json({ 
              success: true, 
              content: contentResponse.data.response 
            });
            
          case "optimize-pricing":
            const productToOptimize = await productService.retrieve(data.productId, {
              relations: ["variants"],
            });
            
            // Get competitor and market data (simplified)
            const pricingResponse = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
              model: AI_MODEL,
              prompt: `Suggest optimal pricing for: ${productToOptimize.title}. 
                       Current price: ${productToOptimize.variants[0]?.prices[0]?.amount / 100}. 
                       Consider market position, perceived value, and profit margins.`,
              stream: false,
            });
            
            return res.status(200).json({ 
              success: true, 
              productId: productToOptimize.id,
              suggestions: pricingResponse.data.response 
            });
            
          default:
            return res.status(400).json({ error: "Invalid action" });
        }
        
      case "GET":
        // Health check
        const aiHealthy = await axios.get(`${OLLAMA_API_URL}/api/tags`)
          .then(() => true)
          .catch(() => false);
          
        const n8nHealthy = N8N_WEBHOOK_URL ? true : false;
        
        return res.status(200).json({
          status: "healthy",
          integrations: {
            ai: {
              enabled: true,
              healthy: aiHealthy,
              model: AI_MODEL,
              url: OLLAMA_API_URL,
            },
            n8n: {
              enabled: n8nHealthy,
              url: N8N_WEBHOOK_URL,
            },
          },
        });
        
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("AI Integration Error:", error);
    return res.status(500).json({ 
      error: "AI integration failed", 
      message: error.message 
    });
  }
}