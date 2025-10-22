import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { BlogPost } from "../components/BlogDisplay";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBlogPost = async (newsletterContent: string): Promise<BlogPost> => {
  try {
    const fullPrompt = `USER QUERY: Based on the following daily newsletter content, please generate the OMEGA blog sermon as per your system instructions.\n\n---\n\n${newsletterContent}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text;
    
    // Parse the response to separate title and body
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      // If parsing fails, return the whole text as the body with a default title
      return {
        title: "Generated Sermon",
        body: text,
      };
    }

    const title = lines[0].replace(/^##\s*/, '').trim(); // Remove markdown h2 syntax
    const body = lines.slice(1).join('\n').trim();

    return { title, body };

  } catch (error) {
    console.error("Error generating blog post:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to generate spiritual sermon. Details: ${errorMessage}`);
  }
};
