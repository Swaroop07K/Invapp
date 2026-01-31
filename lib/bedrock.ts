
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, AIInsights } from "../types";

/**
 * Bedrock Simulation Engine
 * Uses GEMINI_API_KEY from .env for the underlying intelligence layer.
 */
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

const BEDROCK_MODEL = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

export const getNovaLitePredictions = async (item: InventoryItem): Promise<AIInsights> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
      System: Amazon Bedrock Inference [Target Model: ${BEDROCK_MODEL}]
      Task: Perform inventory velocity analysis for resource optimization.
      
      Input Data:
      - Item Name: ${item.name}
      - Current Stock: ${item.current_quantity}
      - Min Required: ${item.min_required_quantity}
      - Unit Price: $${item.price}
      - Recent Activity: ${JSON.stringify(item.sales_history)}
      
      Generate a technical JSON prediction object for the AWS Management Console.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restock_in_days: {
              type: Type.INTEGER,
              description: "Estimated days until capacity is reached.",
            },
            predicted_sales_next_month: {
              type: Type.INTEGER,
              description: "Expected volume for the next 30-day billing cycle.",
            },
            low_stock_alert: {
              type: Type.BOOLEAN,
              description: "Trigger alert if resources are below threshold.",
            },
            explanation: {
              type: Type.STRING,
              description: "Technical summary of the prediction logic.",
            }
          },
          required: ["restock_in_days", "predicted_sales_next_month", "low_stock_alert", "explanation"],
        },
      },
    });

    const result = response.text || "{}";
    return JSON.parse(result) as AIInsights;
  } catch (error) {
    console.error("AI Inference Error:", error);
    // Safety algorithmic fallback
    const avgSales = item.sales_history.reduce((acc, curr) => acc + curr.quantity, 0) / 30;
    return {
      restock_in_days: Math.max(1, Math.floor(item.current_quantity / (avgSales || 1))),
      predicted_sales_next_month: Math.floor(avgSales * 30),
      low_stock_alert: item.current_quantity < item.min_required_quantity,
      explanation: "Fallback analysis enabled. Check console for connectivity errors."
    };
  }
};
