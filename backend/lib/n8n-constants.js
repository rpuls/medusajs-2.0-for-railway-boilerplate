// N8N Integration Constants
export const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n-automation-production-6e02.up.railway.app";
export const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || "medusa_webhook_volaron_2025";
export const N8N_API_KEY = process.env.N8N_API_KEY || "";
export const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://ollama.railway.internal:11434";
export const AI_MODEL = process.env.AI_MODEL || "llama3.1";
export const ENABLE_AI_FEATURES = process.env.ENABLE_AI_FEATURES === "true";