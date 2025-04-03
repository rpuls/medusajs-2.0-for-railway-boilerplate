import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

export async function checkApiKey(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const apiKey = req.headers.authorization;
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "Wrong api key" });
  }
  
  next();
};
