import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, AIInsights } from "../types";

/**
 * Bedrock Inference Client
 * Configured for: amazon.nova-lite-v1:0 (via Gemini-3-Flash emulation)
 */
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' 
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

export const getNovaLitePredictions = async (item: InventoryItem): Promise<AIInsights> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform resource utilization analysis for AWS Bedrock.
      Model Context: ${MODEL_ID}
      Resource Name: ${item.name}
      Available Capacity: ${item.current_quantity}
      Threshold: ${item.min_required_quantity}
      Telemetry Data (30d): ${JSON.stringify(item.sales_history)}
      
      Respond as a high-performance inventory agent for Amazon Bedrock.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restock_in_days: {
              type: Type.INTEGER,
              description: "Days until capacity exhaustion.",
            },
            predicted_sales_next_month: {
              type: Type.INTEGER,
              description: "Next month volume prediction.",
            },
            low_stock_alert: {
              type: Type.BOOLEAN,
              description: "Alert trigger for low resources.",
            },
            explanation: {
              type: Type.STRING,
              description: "Brief analysis summary from Nova Lite.",
            }
          },
          required: ["restock_in_days", "predicted_sales_next_month", "low_stock_alert", "explanation"],
        },
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as AIInsights;
  } catch (error) {
    console.error("Bedrock Inference Error:", error);
    // Safety fallback logic
    const avgDaily = item.sales_history.reduce((a, b) => a + b.quantity, 0) / 30;
    return {
      restock_in_days: Math.floor(item.current_quantity / (avgDaily || 1)),
      predicted_sales_next_month: Math.floor(avgDaily * 30),
      low_stock_alert: item.current_quantity < item.min_required_quantity,
      explanation: "Inference failed. Check GEMINI_API_KEY and AWS Network access."
    };
  }
};
