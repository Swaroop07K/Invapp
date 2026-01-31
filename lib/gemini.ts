
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, AIInsights } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIInventoryPredictions = async (item: InventoryItem): Promise<AIInsights> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following inventory item and provide stock predictions.
      Item: ${item.name}
      Current Stock: ${item.current_quantity}
      Min Required: ${item.min_required_quantity}
      Price: $${item.price}
      Sales History (Last 30 days): ${JSON.stringify(item.sales_history)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restock_in_days: {
              type: Type.INTEGER,
              description: "How many days until stock runs out or hits min threshold based on sales velocity.",
            },
            predicted_sales_next_month: {
              type: Type.INTEGER,
              description: "Forecasted quantity to be sold next month.",
            },
            low_stock_alert: {
              type: Type.BOOLEAN,
              description: "True if current_quantity < min_required_quantity or predicted to drop below within 3 days.",
            },
            explanation: {
              type: Type.STRING,
              description: "Brief reason for this prediction.",
            }
          },
          required: ["restock_in_days", "predicted_sales_next_month", "low_stock_alert"],
        },
      },
    });

    const resultText = response.text || "{}";
    return JSON.parse(resultText) as AIInsights;
  } catch (error) {
    console.error("AI Prediction Error:", error);
    // Fallback basic logic if AI fails
    const avgDailySales = item.sales_history.reduce((acc, curr) => acc + curr.quantity, 0) / 30;
    const daysLeft = Math.floor(item.current_quantity / (avgDailySales || 1));
    return {
      restock_in_days: Math.min(Math.max(daysLeft, 1), 30),
      predicted_sales_next_month: Math.floor(avgDailySales * 30),
      low_stock_alert: item.current_quantity < item.min_required_quantity
    };
  }
};
