// src/embedding/openai.ts
import OpenAI from "openai";
import { getOpenAIApiKey } from "../config";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: getOpenAIApiKey(),
});

// Model to use for embeddings
const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Generate embeddings for a batch of texts using OpenAI's text-embedding-3-small model
 * @param texts Array of text strings to embed
 * @returns Array of embedding vectors
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    });

    // Extract and return the embedding vectors
    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error(`Failed to generate embeddings: ${error}`);
  }
}

/**
 * Generate embedding for a single text
 * @param text Text to embed
 * @returns Embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([text]);
  return embeddings[0];
}
