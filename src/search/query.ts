// src/search/query.ts
import { Collection } from "chromadb";
import { generateEmbedding } from "../embedding/openai";
import { querySimilar } from "../db/collections";

/**
 * Search for similar documents using a text query
 * @param collection ChromaDB collection to search
 * @param query Text query
 * @param limit Maximum number of results to return
 * @returns Search results with documents, distances, and metadata
 */
export async function searchSimilarDocuments(
  collection: Collection,
  query: string,
  limit: number = 5
): Promise<{
  documents: string[];
  distances: number[];
  metadatas: Record<string, any>[];
  ids: string[];
}> {
  try {
    // Generate embedding for the query text
    const queryEmbedding = await generateEmbedding(query);

    // Perform similarity search using the embedding via collections module
    return await querySimilar(collection, queryEmbedding, limit);
  } catch (error) {
    console.error("Error searching for similar documents:", error);
    throw new Error(`Failed to search for similar documents: ${error}`);
  }
}

/**
 * Format search results for display
 * @param results Search results
 * @returns Formatted string for display
 */
export function formatSearchResults(results: {
  documents: string[];
  distances: number[];
  metadatas: Record<string, any>[];
  ids: string[];
}): string {
  if (results.documents.length === 0) {
    return "No results found.";
  }

  let output = `Found ${results.documents.length} results:\n\n`;

  for (let i = 0; i < results.documents.length; i++) {
    const distance = results.distances[i];
    const similarity = 1 - distance; // Convert distance to similarity score
    const metadata = results.metadatas[i] || {};
    const id = results.ids[i];

    output += `Result ${i + 1} (Similarity: ${(similarity * 100).toFixed(2)}%):\n`;
    output += `ID: ${id}\n`;

    if (metadata.source) {
      output += `Source: ${metadata.source}\n`;
    }

    output += `Content: ${results.documents[i].substring(0, 200)}${
      results.documents[i].length > 200 ? "..." : ""
    }\n\n`;
  }

  return output;
}