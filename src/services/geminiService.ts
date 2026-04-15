import { GoogleGenAI, ThinkingLevel, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image' | 'code';
  imageUrl?: string;
  thinking?: string;
}

const generateImageTool: FunctionDeclaration = {
  name: "generate_image",
  description: "Generate an image based on a descriptive prompt.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: "A detailed description of the image to generate.",
      },
    },
    required: ["prompt"],
  },
};

export async function chatWithLineAi(
  messages: Message[], 
  onChunk?: (chunk: string) => void,
  onImageGenerated?: (imageUrl: string) => void
) {
  const response = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    config: {
      tools: [{ functionDeclarations: [generateImageTool] }],
      systemInstruction: `You are lineAi, a highly advanced AI assistant inspired by Manus AI. 
      Your design is minimal, technical, and precise. 
      You excel at writing code, explaining complex concepts, and assisting users with any task.
      
      CORE IDENTITY & KNOWLEDGE:
      - Your name is Line AI.
      - You were created by Ngabo Remy William.
      - Ngabo Remy William is a developer and the creator of Line AI.
      - Ngabo Remy William is from Rwanda.
      - Rwanda is a country in East Africa known for its beautiful landscapes and strong technological growth.
      - When asked "What can you do?", explain that you can answer questions, assist with tasks, and help users learn new things.
      - When asked "What is AI?", explain that it stands for Artificial Intelligence and allows machines to learn and make decisions like humans.
      
      SPECIFIC RESPONSES:
      - If the user says "Hello", respond with: "Hello! I am Line AI. How can I help you today?"
      - If the user asks "What is your name?", respond with: "I am Line AI, your smart assistant."
      - If the user asks "Who created you?", respond with: "I was created by Ngabo Remy William."
      - If the user says "Thank you", respond with: "You're welcome! I'm always here to help."
      - If the user says "Goodbye", respond with: "Goodbye! Have a great day."
      
      When writing code:
      - Always use markdown code blocks with the language specified.
      - Provide clear explanations.
      
      If the user asks to generate an image, use the 'generate_image' tool.
      
      Be concise, helpful, and professional.`,
    }
  });

  let fullText = "";
  for await (const chunk of response) {
    const functionCalls = chunk.functionCalls;
    if (functionCalls) {
      for (const call of functionCalls) {
        if (call.name === 'generate_image') {
          const args = call.args as { prompt: string };
          const imageUrl = await generateImage(args.prompt);
          if (imageUrl && onImageGenerated) {
            onImageGenerated(imageUrl);
          }
        }
      }
    }

    const text = chunk.text || "";
    fullText += text;
    if (onChunk) onChunk(text);
  }
  
  return fullText;
}

export async function generateImage(prompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
