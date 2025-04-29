import { OpenAI } from 'openai';
import { OpenAIEmbeddingFunction } from 'chromadb';
import { config } from '../config';

// Singleton instance of OpenAI client
let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client instance
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }
  return openaiClient;
}

/**
 * Get OpenAI Embedding function for ChromaDB
 */
export function getOpenAIEmbeddingFunction(): OpenAIEmbeddingFunction {
  return new OpenAIEmbeddingFunction({
    openai_api_key: config.openaiApiKey,
    openai_model: config.openaiModel,
  });
}

/**
 * Generate embedding for the given text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  
  const response = await client.embeddings.create({
    model: config.openaiModel,
    input: text,
  });
  
  return response.data[0].embedding;
}