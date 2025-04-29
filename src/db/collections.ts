import { ChromaClient, Collection } from 'chromadb';
import { getChromaClient } from './chroma-client';
import { getOpenAIEmbeddingFunction } from '../embedding/openai';

// Collection name
const COLLECTION_NAME = 'markdown_documents';

/**
 * Get or create a collection for Markdown documents
 */
export async function getOrCreateCollection(): Promise<Collection> {
  const client = getChromaClient();
  const embedder = getOpenAIEmbeddingFunction();
  
  try {
    // Get collection, create if it doesn't exist
    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction: embedder,
    });
    
    console.log(`Collection '${COLLECTION_NAME}' retrieved`);
    return collection;
  } catch (error) {
    console.error('Error occurred while getting/creating collection:', error);
    throw error;
  }
}

/**
 * Add documents to collection
 */
export async function addDocumentsToCollection(
  collection: Collection,
  documents: Array<{
    id: string, 
    content: string, 
    metadata: Record<string, any>
  }>
): Promise<void> {
  try {
    await collection.add({
      ids: documents.map(doc => doc.id),
      documents: documents.map(doc => doc.content),
      metadatas: documents.map(doc => doc.metadata),
    });
    
    console.log(`Added ${documents.length} documents to collection`);
  } catch (error) {
    console.error('Error occurred while adding documents:', error);
    throw error;
  }
}

/**
 * Query documents from collection
 */
export async function queryCollection(
  collection: Collection,
  queryText: string,
  nResults: number = 5
) {
  try {
    const results = await collection.query({
      queryTexts: [queryText],
      nResults: nResults,
    });
    
    return results;
  } catch (error) {
    console.error('Error occurred while querying:', error);
    throw error;
  }
}