# ChromaDB TypeScript Implementation Project

This document outlines the steps to build a vector search system using TypeScript and ChromaDB.

## Project Objectives

Create a TypeScript application that accomplishes the following tasks:

1. Create a Persistent ChromaDB instance with local storage
2. Extract text from local Markdown files and add them to the database
3. Vectorize text using OpenAI's text-embedding-3-small model
4. Perform similarity searches using keywords or sentences as queries

## Environment Setup

### 1. Project Initialization

```bash
# Navigate to the project root directory
cd /home/noriaki/workspace/ai-programming/playground-cromadb

# Initialize TypeScript project
pnpm init
pnpm add -D typescript ts-node @types/node
pnpm exec tsc --init
```

### 2. Install Required Packages

```bash
# Install ChromaDB, OpenAI client, and other utilities
pnpm add chromadb openai dotenv markdown-it glob
pnpm add -D @types/markdown-it @types/glob
```

### 3. Environment Variables Setup

Create a `.env` file in the project root with the following content:

```
OPENAI_API_KEY=your_openai_api_key
```

## Directory Structure

Use the following directory structure for the project:

```
/playground-cromadb
  ├── .env                      # Environment variables
  ├── package.json              # npm package configuration
  ├── tsconfig.json             # TypeScript configuration
  ├── src/
  │   ├── index.ts              # Entry point
  │   ├── config.ts             # Configuration management
  │   ├── db/
  │   │   ├── chroma-client.ts  # ChromaDB client
  │   │   └── collections.ts    # Collection management
  │   ├── embedding/
  │   │   └── openai.ts         # OpenAI Embedding management
  │   ├── markdown/
  │   │   ├── loader.ts         # Markdown file loader
  │   │   └── parser.ts         # Markdown parser
  │   └── search/
  │       └── query.ts          # Search logic
  ├── data/
  │   └── markdown/             # Sample Markdown files storage
  └── dist/                     # Compiled JavaScript files
```

## Implementation Steps

### 1. Configuration and Client Creation

#### src/config.ts

```typescript
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Configuration settings
export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: 'text-embedding-3-small', // OpenAI Embedding model
  markdownDir: './data/markdown',        // Markdown files directory
  chunkSize: 1000,                       // Text chunk size
  chunkOverlap: 200,                     // Overlap size between chunks
  chromaDb: {
    persistDirectory: path.join(process.cwd(), 'chroma_db'), // Path for persistent storage
    collectionName: 'markdown_documents',                    // Default collection name
  },
};

// Validate required environment variables
export function validateConfig(): void {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set.');
  }
}
```

#### src/db/chroma-client.ts

```typescript
import { ChromaClient, PersistentClient } from 'chromadb';
import { config } from '../config';

// Singleton instance of ChromaDB client
let client: ChromaClient | null = null;

/**
 * Get ChromaDB client instance
 * Instantiate in PersistentClient mode for local file storage
 */
export function getChromaClient(): ChromaClient {
  if (!client) {
    // Initialize with PersistentClient for local file storage
    client = new PersistentClient({
      path: config.chromaDb.persistDirectory,
    });
    console.log(`ChromaDB PersistentClient initialized with storage at: ${config.chromaDb.persistDirectory}`);
  }
  return client;
}

/**
 * Check client health
 */
export async function checkClientHealth(): Promise<boolean> {
  try {
    const client = getChromaClient();
    const heartbeat = await client.heartbeat();
    console.log(`ChromaDB connection check: ${heartbeat}`);
    return true;
  } catch (error) {
    console.error('Failed to connect to ChromaDB client:', error);
    return false;
  }
}

/**
 * Reset the database (WARNING: Destructive operation)
 * Useful during development or for complete reindexing
 */
export async function resetDatabase(): Promise<boolean> {
  try {
    const client = getChromaClient();
    await client.reset();
    console.log('ChromaDB database has been reset');
    return true;
  } catch (error) {
    console.error('Failed to reset ChromaDB database:', error);
    return false;
  }
}
```

### 2. OpenAI Embedding Implementation

#### src/embedding/openai.ts

```typescript
import { OpenAI } from 'openai';
import { OpenAIEmbeddingFunction } from 'chromadb';
import { config } from '../config';

// Singleton instance of OpenAI client
let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client instance
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }
  return openaiClient;
}

/**
 * Get OpenAI Embedding function for ChromaDB
 */
export function getOpenAIEmbeddingFunction(): OpenAIEmbeddingFunction {
  return new OpenAIEmbeddingFunction({
    openai_api_key: config.openaiApiKey,
    model_name: config.openaiModel,
  });
}

/**
 * Generate embedding for the given text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  
  const response = await client.embeddings.create({
    model: config.openaiModel,
    input: text,
  });
  
  return response.data[0].embedding;
}
```

### 3. Markdown File Processing

#### src/markdown/loader.ts

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { config } from '../config';

/**
 * Get all Markdown file paths from the specified directory
 */
export function getMarkdownFiles(): string[] {
  const pattern = path.join(config.markdownDir, '**/*.md');
  return glob.sync(pattern);
}

/**
 * Read file content
 */
export function readMarkdownFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to read file ${filePath}:`, error);
    return '';
  }
}

/**
 * Load content and related information from all Markdown files
 */
export function loadAllMarkdownContents(): Array<{ 
  id: string, 
  content: string, 
  metadata: { 
    source: string, 
    filename: string 
  } 
}> {
  const files = getMarkdownFiles();
  const contents = files.map((file, index) => {
    const content = readMarkdownFile(file);
    const filename = path.basename(file);
    
    return {
      id: `doc-${index}`,
      content: content,
      metadata: {
        source: file,
        filename: filename
      }
    };
  });
  
  return contents;
}
```

#### src/markdown/parser.ts

```typescript
import MarkdownIt from 'markdown-it';
import { config } from '../config';

// Markdown-it instance
const md = new MarkdownIt();

/**
 * Convert Markdown to HTML
 */
export function parseMarkdownToHtml(markdown: string): string {
  return md.render(markdown);
}

/**
 * Extract text from Markdown (remove HTML tags)
 */
export function parseMarkdownToText(markdown: string): string {
  const html = parseMarkdownToHtml(markdown);
  // Simple HTML tag removal
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Split long text into chunks with overlapping parts
 */
export function splitTextIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  const { chunkSize, chunkOverlap } = config;
  
  if (text.length <= chunkSize) {
    chunks.push(text);
    return chunks;
  }
  
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - chunkOverlap;
    
    // Exit if remaining text is smaller than overlap
    if (start + chunkOverlap >= text.length) {
      break;
    }
  }
  
  return chunks;
}
```

### 4. Collection Management

#### src/db/collections.ts

```typescript
import { ChromaClient, Collection } from 'chromadb';
import { getChromaClient } from './chroma-client';
import { getOpenAIEmbeddingFunction } from '../embedding/openai';
import { config } from '../config';

/**
 * Get or create a collection for Markdown documents
 */
export async function getOrCreateCollection(): Promise<Collection> {
  const client = getChromaClient();
  const embedder = getOpenAIEmbeddingFunction();
  
  try {
    // Get collection, create if it doesn't exist
    const collection = await client.getOrCreateCollection({
      name: config.chromaDb.collectionName,
      embeddingFunction: embedder,
      metadata: {
        description: "Collection for markdown documents with OpenAI embeddings",
        created_at: new Date().toISOString(),
      }
    });
    
    console.log(`Collection '${config.chromaDb.collectionName}' retrieved or created`);
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
 * Upsert documents to collection (add or update if exists)
 */
export async function upsertDocumentsToCollection(
  collection: Collection,
  documents: Array<{
    id: string, 
    content: string, 
    metadata: Record<string, any>
  }>
): Promise<void> {
  try {
    await collection.upsert({
      ids: documents.map(doc => doc.id),
      documents: documents.map(doc => doc.content),
      metadatas: documents.map(doc => doc.metadata),
    });
    
    console.log(`Upserted ${documents.length} documents to collection`);
  } catch (error) {
    console.error('Error occurred while upserting documents:', error);
    throw error;
  }
}

/**
 * Count documents in the collection
 */
export async function countDocumentsInCollection(
  collection: Collection
): Promise<number> {
  try {
    return await collection.count();
  } catch (error) {
    console.error('Error occurred while counting documents:', error);
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
```

### 5. Search Implementation

#### src/search/query.ts

```typescript
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
```

### 6. Main Execution File

#### src/index.ts

```typescript
import { validateConfig, config } from './config';
import { checkClientHealth } from './db/chroma-client';
import { getOrCreateCollection, addDocumentsToCollection, upsertDocumentsToCollection, countDocumentsInCollection } from './db/collections';
import { loadAllMarkdownContents } from './markdown/loader';
import { parseMarkdownToText, splitTextIntoChunks } from './markdown/parser';
import { searchByText } from './search/query';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  try {
    // Validate configuration
    validateConfig();
    
    // Ensure persist directory exists
    const persistDir = config.chromaDb.persistDirectory;
    if (!fs.existsSync(persistDir)) {
      console.log(`Creating persistence directory at: ${persistDir}`);
      fs.mkdirSync(persistDir, { recursive: true });
    }
    
    // Check ChromaDB client health
    const isHealthy = await checkClientHealth();
    if (!isHealthy) {
      throw new Error('ChromaDB client is not operating properly');
    }
    
    // Get collection
    const collection = await getOrCreateCollection();
    
    // Check if collection already has documents
    const documentCount = await countDocumentsInCollection(collection);
    console.log(`Collection has ${documentCount} documents`);
    
    // Load Markdown files
    const markdownContents = loadAllMarkdownContents();
    console.log(`Loaded ${markdownContents.length} Markdown files`);
    
    // Process documents and prepare for collection
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
          docId: doc.id,
          lastUpdated: new Date().toISOString()
        }
      }));
    });
    
    // Add or update documents in collection
    if (processedDocuments.length > 0) {
      // We use upsert to handle updates to existing documents
      await upsertDocumentsToCollection(collection, processedDocuments);
      console.log(`Collection now has ${await countDocumentsInCollection(collection)} documents`);
    }
    
    // Test search
    const testQuery = "Features of TypeScript"; // Test query
    console.log(`Searching for query "${testQuery}"...`);
    
    const searchResults = await searchByText(collection, testQuery);
    
    console.log('Search results:');
    searchResults.forEach((result, index) => {
      console.log(`\n#${index + 1} (Similarity: ${1 - result.distance})`);
      console.log(`Source: ${result.metadata.filename}`);
      console.log(`Content: ${result.document.substring(0, 150)}...`);
    });
    
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Execute main function
main();
```

## Execution Method

Run the project with the following commands:

```bash
# Compile TypeScript
pnpm exec tsc

# Run the application
node dist/index.js
```

When you run the application, it will:
1. Create a persistent ChromaDB database in the `chroma_db` directory
2. Process and embed markdown files 
3. Store the results for future use
4. Subsequent runs will update the existing database rather than starting from scratch

## Extension Ideas

1. **Web UI**: Provide search functionality through a simple web UI
2. **Metrics**: Implement mechanisms to evaluate search quality and performance
3. **Embedding Model Comparison**: Compare performance with other embedding models
4. **Multimodal Support**: Extend to support images and other data types
5. **Data Sync**: Add functionality to sync with remote data sources

## Troubleshooting

1. **OPENAI_API_KEY not set error**: Verify that the API key is correctly set in the `.env` file.
2. **ChromaDB client connection error**: Check for version compatibility with ChromaDB.
3. **Memory errors**: Adjust chunk sizes or switch to streaming processing when handling large amounts of data.
4. **Database permission errors**: Ensure the application has write permissions to the persistence directory.
5. **Database corruption**: If experiencing issues with the database, delete the `chroma_db` directory to start fresh, but note that this will remove all indexed data.

## Reference Resources

- [ChromaDB Official Documentation](https://docs.trychroma.com/)
- [ChromaDB Persistent Storage Guide](https://docs.trychroma.com/docs/run-chroma/persistent-client)
- [ChromaDB Clients (TypeScript) Repository](https://github.com/chroma-core/chroma/tree/main/clients/js)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)

## Development Guidelines

### Claude Code Behavior

- **Language Usage**:
  - User interactions will be conducted in Japanese
  - Technical documentation, comments, and internal thinking will be in English

### Version Control and Collaboration

- **Git Version Control**:
  - Appropriate granularity and timing for version control using Git
  - Following GitHub Flow branch strategy: creating and switching branches per task
  - Commit messages and Pull Requests will be written in concise, clear English
  - All merges to the main branch must go through Pull Requests
    - In principle, users will review Pull Requests on GitHub and perform merges
    - Claude may merge Pull Requests only when explicitly instructed by the user
  - Actively utilize MCP server Tool functions for Git and GitHub operations
