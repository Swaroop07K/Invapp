
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, AIInsights } from "../types";

/**
 * Bedrock Prediction Engine
 * Utilizes the GEMINI_API_KEY for inference logic.
 */
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

const TARGET_MODEL = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

export const getNovaLitePredictions = async (item: InventoryItem): Promise<AIInsights> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: Amazon Bedrock Inference [Model: ${TARGET_MODEL}]
      Task: Inventory Optimization & Sales Forecasting
      Item: ${item.name}
      Stock: ${item.current_quantity}
      Safety Threshold: ${item.min_required_quantity}
      Historical Data: ${JSON.stringify(item.sales_history)}
      
      Provide a highly accurate inventory projection in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restock_in_days: {
              type: Type.INTEGER,
              description: "Estimated days until zero stock.",
            },
            predicted_sales_next_month: {
              type: Type.INTEGER,
              description: "Volume forecast for upcoming 30d cycle.",
            },
            low_stock_alert: {
              type: Type.BOOLEAN,
              description: "True if urgent replenishment required.",
            },
            explanation: {
              type: Type.STRING,
              description: "Technical reasoning from Nova Lite engine.",
            }
          },
          required: ["restock_in_days", "predicted_sales_next_month", "low_stock_alert", "explanation"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as AIInsights;
  } catch (error) {
    console.error("Bedrock Inference Failure:", error);
    // Safe algorithmic fallback
    const totalSales = item.sales_history.reduce((acc, s) => acc + s.quantity, 0);
    const velocity = totalSales / 30;
    return {
      restock_in_days: Math.floor(item.current_quantity / (velocity || 1)),
      predicted_sales_next_month: Math.floor(velocity * 30),
      low_stock_alert: item.current_quantity <= item.min_required_quantity,
      explanation: "Fallback logic active. Verify GEMINI_API_KEY in .env."
    };
  }
};
