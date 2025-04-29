// src/embedding/openai.ts
import OpenAI from "openai";
import { getOpenAIApiKey } from "../config";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: getOpenAIApiKey(),
});

// Model to use for embeddings
const EMBEDDING_MODEL = "text-embedding-3-small";

// Batch size for processing embeddings to reduce memory usage
const BATCH_SIZE = 1; // Process one chunk at a time to minimize memory usage

/**
 * Generate embeddings for a batch of texts using OpenAI's text-embedding-3-small model
 * @param texts Array of text strings to embed
 * @returns Array of embedding vectors
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // Process in small batches to reduce memory usage
    const embeddings: number[][] = [];

    // Process texts in batches
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batchTexts = texts.slice(i, i + BATCH_SIZE);
      console.log(`Processing embedding batch ${i / BATCH_SIZE + 1} of ${Math.ceil(texts.length / BATCH_SIZE)}`);

      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batchTexts,
      });

      // Extract embeddings from response
      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);

      // Explicitly help garbage collection
      response.data.length = 0;

      // Add a small delay between batches to allow for GC
      if (i + BATCH_SIZE < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return embeddings;
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
