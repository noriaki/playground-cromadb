import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration settings
export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: 'text-embedding-3-small', // OpenAI Embedding model
  markdownDir: './data/markdown',        // Markdown files directory
  chunkSize: 1000,                       // Text chunk size
  chunkOverlap: 200,                     // Overlap size between chunks
};

// Validate required environment variables
export function validateConfig(): void {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set.');
  }
}