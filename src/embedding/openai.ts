// src/embedding/openai.ts
import OpenAI from "openai";
import { getOpenAIApiKey } from "../config";
import { reportMemoryUsage } from "../utils/memory-monitor";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: getOpenAIApiKey(),
});

// Model to use for embeddings
const EMBEDDING_MODEL = "text-embedding-3-small";

// Default batch size for processing embeddings to reduce API calls
// Increased from 1 to 3 for better efficiency while maintaining manageable memory usage
const DEFAULT_BATCH_SIZE = 3;

// Maximum number of embeddings per API call (OpenAI limit is 2048)
const MAX_OPENAI_BATCH_SIZE = 20;

/**
 * Generate embeddings for a batch of texts using OpenAI's text-embedding-3-small model
 * Optimized for memory efficiency with adaptive batch sizing
 * 
 * @param texts Array of text strings to embed
 * @param batchSize Optional custom batch size (default: 3)
 * @returns Array of embedding vectors
 */
export async function generateEmbeddings(
  texts: string[], 
  batchSize: number = DEFAULT_BATCH_SIZE
): Promise<number[][]> {
  try {
    // Safety check
    if (!texts || texts.length === 0) {
      console.warn("Empty texts array passed to generateEmbeddings");
      return [];
    }
    
    // Ensure batch size is within reasonable limits
    batchSize = Math.min(Math.max(1, batchSize), MAX_OPENAI_BATCH_SIZE);
    
    // Process in batches to reduce memory usage and optimize API calls
    const embeddings: number[][] = [];
    const totalBatches = Math.ceil(texts.length / batchSize);

    // Process texts in batches
    for (let i = 0; i < texts.length; i += batchSize) {
      const batchTexts = texts.slice(i, i + batchSize);
      console.log(`Processing embedding batch ${Math.floor(i / batchSize) + 1} of ${totalBatches}`);

      // Make API call
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batchTexts,
        encoding_format: "float", // Explicitly request float format for consistency
      });

      // Extract embeddings from response
      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);

      // Explicitly help garbage collection
      if (response.data) {
        response.data.length = 0;
      }

      // Add a small delay between batches to allow for GC
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Force GC every few batches if available
      if (i % (batchSize * 5) === 0 && typeof global.gc === 'function') {
        try { global.gc(); } catch (e) {}
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
  return embeddings[0] || [];
}

/**
 * Calculate the cosine similarity between two embedding vectors
 * @param embedding1 First embedding vector
 * @param embedding2 Second embedding vector
 * @returns Cosine similarity score (0-1)
 */
export function calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
    throw new Error("Invalid embeddings for similarity calculation");
  }
  
  // Calculate dot product
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    const val1 = embedding1[i] || 0;
    const val2 = embedding2[i] || 0;
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  // Handle zero vectors
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  // Calculate cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
}