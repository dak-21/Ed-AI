
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

export async function runAITool(prompt: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || 'No response generated.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Error: Failed to generate response.';
  }
}

export async function askKnowledgeBase(query: string, context: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `
      You are the EduSphere Institutional Intelligence assistant. 
      You have access to the following school resources:
      ---
      ${context}
      ---
      RULES:
      1. Answer ONLY using the information provided above.
      2. If the answer is not in the context, say "I'm sorry, that information is not available in our current school resources."
      3. Be professional, academic, and concise.
      4. Mention which resource or topic you are citing.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    return response.text || 'No data found.';
  } catch (error) {
    return 'Failed to query knowledge base.';
  }
}

export async function generateLessonPlan(config: any): Promise<any> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a highly professional, structured lesson plan for ${config.grade} ${config.subject}. 
    Topic: ${config.topic}. 
    Duration: ${config.duration}.
    Standards: ${config.standards}.
    Format the response as a JSON object matching the LessonPlan interface with 'objectives', 'sections' (array with 'title', 'content', 'duration'), 'assessment', and 'differentiation'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro for complex educational planning
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            subject: { type: Type.STRING },
            grade: { type: Type.STRING },
            duration: { type: Type.STRING },
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            standards: { type: Type.ARRAY, items: { type: Type.STRING } },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  duration: { type: Type.STRING }
                },
                required: ['title', 'content']
              }
            },
            assessment: { type: Type.STRING },
            differentiation: { type: Type.STRING }
          },
          required: ['topic', 'objectives', 'sections', 'assessment', 'differentiation']
        }
      }
    });

    // Fix: Access response.text property directly
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateSlideImage(prompt: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A professional academic illustration for: ${prompt}. Clean, educational style.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function* streamAITool(prompt: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Access chunk.text property directly
    for await (const chunk of stream) yield chunk.text;
  } catch (error) {
    yield 'Error: Failed to stream content.';
  }
}
