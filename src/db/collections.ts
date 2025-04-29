// src/db/collections.ts
import { ChromaClient, Collection } from "chromadb";

const COLLECTION_NAME = "markdown_embeddings";

/**
 * Get or create a collection for storing markdown embeddings
 */
export async function getOrCreateCollection(client: ChromaClient): Promise<Collection> {
  try {
    // Try to get existing collection
    return await client.getCollection({
      name: COLLECTION_NAME,
    });
  } catch (error) {
    // Create new collection if it doesn't exist
    return await client.createCollection({
      name: COLLECTION_NAME,
      metadata: { description: "Embeddings of markdown files" }
    });
  }
}

/**
 * Add or update documents in the collection
 */
export async function upsertDocuments(
  collection: Collection,
  ids: string[],
  documents: string[],
  embeddings: number[][],
  metadatas?: Record<string, any>[]
): Promise<void> {
  await collection.upsert({
    ids,
    documents,
    embeddings,
    metadatas: metadatas || Array(ids.length).fill({})
  });
}

/**
 * Perform similarity search on the collection
 */
export async function querySimilar(
  collection: Collection,
  queryEmbedding: number[],
  limit: number = 5
): Promise<{
  ids: string[];
  documents: string[];
  distances: number[];
  metadatas: Record<string, any>[];
}> {
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
    include: ["documents", "distances", "metadatas"] as any
  });

  return {
    ids: results.ids?.[0] || [],
    documents: (results.documents?.[0] || []).filter(Boolean) as string[],
    distances: results.distances?.[0] || [],
    metadatas: (results.metadatas?.[0] || []).filter(Boolean) as Record<string, any>[]
  };
}
