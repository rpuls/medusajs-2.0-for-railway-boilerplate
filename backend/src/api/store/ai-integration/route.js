// AI Integration Route - Temporarily disabled
// This file is temporarily commented out to allow backend deployment
// Will be re-enabled after fixing the import path issue

/*
import axios from "axios";
import { N8N_CONFIG, OLLAMA_API_URL, AI_MODEL, N8N_WEBHOOK_URL, N8N_API_KEY } from "../../../lib/n8n-constants.js";

export default async function handler(req, res) {
  return res.status(503).json({ 
    error: "AI integration temporarily disabled", 
    message: "Service is being configured" 
  });
}
*/

export default async function handler(req, res) {
  return res.status(503).json({ 
    error: "AI integration temporarily disabled", 
    message: "Service is being configured. Please try again later." 
  });
}