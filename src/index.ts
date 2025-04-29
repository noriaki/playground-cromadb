import { validateConfig } from './config';
import { checkClientHealth } from './db/chroma-client';
import { getOrCreateCollection, addDocumentsToCollection } from './db/collections';
import { loadAllMarkdownContents } from './markdown/loader';
import { parseMarkdownToText, splitTextIntoChunks } from './markdown/parser';
import { searchByText } from './search/query';

async function main() {
  try {
    // Validate configuration
    validateConfig();
    
    // Check ChromaDB client health
    const isHealthy = await checkClientHealth();
    if (!isHealthy) {
      throw new Error('ChromaDB client is not operating properly');
    }
    
    // Get collection
    const collection = await getOrCreateCollection();
    
    // Load Markdown files
    const markdownContents = loadAllMarkdownContents();
    console.log(`Loaded ${markdownContents.length} Markdown files`);
    
    // Process documents and add to collection
    const processedDocuments = markdownContents.flatMap((doc, docIndex) => {
      // Convert Markdown to text
      const text = parseMarkdownToText(doc.content);
      
      // Split text into chunks
      const chunks = splitTextIntoChunks(text);
      
      // Generate document for each chunk
      return chunks.map((chunk, chunkIndex) => ({
        id: `${doc.id}-chunk-${chunkIndex}`,
        content: chunk,
        metadata: {
          ...doc.metadata,
          chunkIndex,
          docIndex,
          docId: doc.id
        }
      }));
    });
    
    // Add documents to collection
    if (processedDocuments.length > 0) {
      await addDocumentsToCollection(collection, processedDocuments);
    }
    
    // Test search
    const testQuery = "Features of TypeScript"; // Test query
    console.log(`Searching for query "${testQuery}"...`);
    
    const searchResults = await searchByText(collection, testQuery);
    
    console.log('Search results:');
    searchResults.forEach((result, index) => {
      console.log(`\n#${index + 1} (Similarity: ${1 - result.distance})`);
      console.log(`Source: ${result.metadata.filename}`);
      if (result.document) {
        console.log(`Content: ${result.document.substring(0, 150)}...`);
      }
    });
    
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Execute main function
main();