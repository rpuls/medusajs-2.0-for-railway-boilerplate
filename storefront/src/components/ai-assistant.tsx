import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, MessageSquare, Zap } from 'lucide-react';

interface AIAssistantProps {
  productId?: string;
  customerId?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ productId, customerId }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [showAssistant, setShowAssistant] = useState(false);

  const callAIEndpoint = async (action: string, data: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ai-integration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });
      
      const result = await res.json();
      return result;
    } catch (error) {
      console.error('AI Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async () => {
    if (!productId) return;
    
    const result = await callAIEndpoint('generate-product-description', { productId });
    if (result?.description) {
      setResponse(result.description);
    }
  };

  const getRecommendations = async () => {
    if (!customerId) return;
    
    const result = await callAIEndpoint('personalize-recommendations', { customerId });
    if (result?.recommendations) {
      setResponse(result.recommendations);
    }
  };

  const analyzeTrends = async () => {
    const result = await callAIEndpoint('analyze-sales-trends', {});
    if (result?.analysis) {
      setResponse(result.analysis);
    }
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowAssistant(!showAssistant)}
          className="rounded-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>

      {/* AI Assistant Panel */}
      {showAssistant && (
        <div className="fixed bottom-20 right-6 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 z-50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Assistant
            </h3>
            <button
              onClick={() => setShowAssistant(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {productId && (
              <Button
                onClick={generateDescription}
                disabled={loading}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Melhorar Descrição do Produto
              </Button>
            )}

            {customerId && (
              <Button
                onClick={getRecommendations}
                disabled={loading}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Zap className="h-4 w-4" />
                Recomendações Personalizadas
              </Button>
            )}

            <Button
              onClick={analyzeTrends}
              disabled={loading}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Análise de Tendências
            </Button>
          </div>

          {loading && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Processando com IA...
                </span>
              </div>
            </div>
          )}

          {response && !loading && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-64 overflow-y-auto">
              <h4 className="text-sm font-semibold mb-2 text-purple-600">
                Resposta da IA:
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {response}
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Llama 3.1 & N8N Automation
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// Hook para usar o AI Assistant
export const useAIAssistant = () => {
  const [loading, setLoading] = useState(false);

  const callAI = async (action: string, data: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ai-integration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });
      
      const result = await res.json();
      return result;
    } catch (error) {
      console.error('AI Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { callAI, loading };
};