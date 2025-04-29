import { Collection } from 'chromadb';
import { queryCollection } from '../db/collections';

/**
 * Execute text-based search
 */
export async function searchByText(
  collection: Collection,
  queryText: string,
  nResults: number = 5
) {
  try {
    const results = await queryCollection(collection, queryText, nResults);
    
    // Format results
    const formattedResults = results.documents?.[0]?.map((document, index) => {
      const metadata = results.metadatas?.[0]?.[index] || {};
      const distance = results.distances?.[0]?.[index] || 0;
      
      return {
        document,
        metadata,
        distance,
        id: results.ids?.[0]?.[index]
      };
    }) || [];
    
    return formattedResults;
  } catch (error) {
    console.error('Error occurred during search processing:', error);
    throw error;
  }
}

/**
 * Search with metadata filtering
 */
export async function searchWithFilter(
  collection: Collection,
  queryText: string, 
  filter: Record<string, any>,
  nResults: number = 5
) {
  try {
    const results = await collection.query({
      queryTexts: [queryText],
      nResults: nResults,
      where: filter
    });
    
    // Format results
    const formattedResults = results.documents?.[0]?.map((document, index) => {
      const metadata = results.metadatas?.[0]?.[index] || {};
      const distance = results.distances?.[0]?.[index] || 0;
      
      return {
        document,
        metadata,
        distance,
        id: results.ids?.[0]?.[index]
      };
    }) || [];
    
    return formattedResults;
  } catch (error) {
    console.error('Error occurred during filtered search:', error);
    throw error;
  }
}