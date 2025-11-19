import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export class GeminiService {
  private ai: GoogleGenAI;
  private modelId = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzePage(imageFile: File): Promise<string> {
    try {
      const imagePart = await fileToGenerativePart(imageFile);
      
      const prompt = `
        You are an expert design and marketing assistant. 
        Analyze this leaflet/brochure page. 
        Provide a concise summary of the content, identify any key dates, prices, or calls to action.
        Also, comment briefly on the visual hierarchy.
        Format the response in Markdown.
      `;

      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: this.modelId,
        contents: {
          parts: [imagePart, { text: prompt }]
        },
        config: {
          temperature: 0.4,
        }
      });

      return response.text || "No analysis available.";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return "Unable to analyze this page at the moment. Please check your API key.";
    }
  }

  async chatWithPage(history: ChatMessage[], newMessage: string, currentImageFile: File | null): Promise<string> {
    try {
      const parts: any[] = [{ text: newMessage }];
      
      // If there is a current page image context, include it in the prompt
      if (currentImageFile) {
        const imagePart = await fileToGenerativePart(currentImageFile);
        parts.unshift(imagePart);
      }

      const systemInstruction = "You are a helpful assistant answering questions about a specific page of a digital leaflet. Be concise and friendly.";

      // Note: For single-turn visual QA, we often just send the image + prompt as a generateContent call
      // rather than maintaining a full chat session object with images (which can be token heavy).
      // Simulating chat behavior here for the specific page context.
      
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: this.modelId,
        contents: {
          parts: parts
        },
        config: {
          systemInstruction: systemInstruction
        }
      });

      return response.text || "I couldn't understand that.";

    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }
}

export const geminiService = new GeminiService();