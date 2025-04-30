// src/db/collections.ts
import { ChromaClient, Collection } from "chromadb";
import { reportMemoryUsage } from "../utils/memory-monitor";

const COLLECTION_NAME = "markdown_embeddings";

/**
 * Get or create a collection for storing markdown embeddings
 * Optimized for consistent performance by cleaning up existing collection 
 */
export async function getOrCreateCollection(client: ChromaClient): Promise<Collection> {
  try {
    reportMemoryUsage("before_collection_creation");

    // Delete existing collection if it exists to avoid errors and ensure consistency
    try {
      const collections = await client.listCollections();
      if (collections.includes(COLLECTION_NAME)) {
        console.log(`Existing collection ${COLLECTION_NAME} found. Deleting for clean reload.`);
        await client.deleteCollection({ name: COLLECTION_NAME });
        // Small delay to ensure deletion is complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.log("Error checking existing collections:", error);
    }
    
    // Create new collection with optimized settings
    const collection = await client.createCollection({
      name: COLLECTION_NAME,
      metadata: { 
        description: "Embeddings of markdown files",
        created: new Date().toISOString(),
        contentType: "markdown",
        embeddingModel: "text-embedding-3-small"
      }
    });
    
    reportMemoryUsage("after_collection_creation");
    return collection;
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
}

/**
 * Add or update documents in the collection
 * Optimized for batch operations with error handling
 */
export async function upsertDocuments(
  collection: Collection,
  ids: string[],
  documents: string[],
  embeddings: number[][],
  metadatas?: Record<string, any>[]
): Promise<void> {
  try {
    // Validate input data to prevent API errors
    if (!ids.length || ids.length !== documents.length || ids.length !== embeddings.length) {
      throw new Error("Mismatched array lengths in upsertDocuments");
    }
    
    if (metadatas && metadatas.length !== ids.length) {
      throw new Error("Metadata array length must match ids array length");
    }
    
    // Report memory usage for large batches
    if (ids.length > 5) {
      reportMemoryUsage(`before_upsert_${ids.length}_documents`);
    }
    
    // Execute upsert operation
    await collection.upsert({
      ids,
      documents,
      embeddings,
      metadatas: metadatas || Array(ids.length).fill({})
    });
    
    // Report memory usage for large batches
    if (ids.length > 5) {
      reportMemoryUsage(`after_upsert_${ids.length}_documents`);
    }
  } catch (error) {
    console.error("Error upserting documents:", error);
    throw error;
  }
}

/**
 * Perform similarity search on the collection
 * Optimized with more detailed error handling
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
  try {
    reportMemoryUsage("before_query");
    
    // Validate input
    if (!queryEmbedding || !queryEmbedding.length) {
      throw new Error("Invalid query embedding");
    }
    
    // Perform query
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      include: ["documents", "distances", "metadatas"] as any
    });
    
    reportMemoryUsage("after_query");
    
    // Format and validate results
    return {
      ids: results.ids?.[0] || [],
      documents: (results.documents?.[0] || []).filter(Boolean) as string[],
      distances: results.distances?.[0] || [],
      metadatas: (results.metadatas?.[0] || []).filter(Boolean) as Record<string, any>[]
    };
  } catch (error) {
    console.error("Error querying collection:", error);
    throw new Error(`Failed to query collection: ${error}`);
  }
}

/**
 * Count documents in the collection
 */
export async function countDocuments(collection: Collection): Promise<number> {
  try {
    return await collection.count();
  } catch (error) {
    console.error("Error counting documents:", error);
    throw new Error(`Failed to count documents: ${error}`);
  }
}

/**
 * Delete documents from the collection
 */
export async function deleteDocuments(
  collection: Collection,
  ids: string[]
): Promise<void> {
  try {
    await collection.delete({
      ids
    });
  } catch (error) {
    console.error("Error deleting documents:", error);
    throw new Error(`Failed to delete documents: ${error}`);
  }
}