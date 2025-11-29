import { GoogleGenAI, Type } from "@google/genai";
import { ImageFormat, AISuggestion } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getOptimizationSuggestion = async (
  userRequest: string,
  originalWidth: number,
  originalHeight: number
): Promise<AISuggestion> => {
  try {
    const ai = getAiClient();
    
    const prompt = `
      User wants to resize/optimize an image. 
      Current Dimensions: ${originalWidth}x${originalHeight}.
      User Request: "${userRequest}"

      Suggest the best width, height, quality (0.1 to 1.0), and format (image/jpeg, image/png, image/webp).
      If the user implies a specific social media or use case (e.g., "for instagram story"), use standard dimensions for that platform.
      If user just says "smaller", reduce dimensions by 50% or optimize quality.
      Maintain aspect ratio is handled by the UI, but provide target dimensions that fit the aspect ratio if possible, or just the constraints.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            width: { type: Type.INTEGER, description: "Suggested width in pixels" },
            height: { type: Type.INTEGER, description: "Suggested height in pixels" },
            quality: { type: Type.NUMBER, description: "Compression quality from 0.1 to 1.0" },
            format: { 
              type: Type.STRING, 
              enum: [ImageFormat.JPEG, ImageFormat.PNG, ImageFormat.WEBP],
              description: "The best image format"
            },
            explanation: { type: Type.STRING, description: "Short explanation of why these settings were chosen." }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AISuggestion;
    }
    
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
