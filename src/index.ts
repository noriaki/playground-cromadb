// src/index.ts
import { getOpenAIApiKey } from "./config";
import { createChromaClient, checkChromaHealth } from "./db/chroma-client";
import { getOrCreateCollection, upsertDocuments } from "./db/collections";
import { generateEmbeddings, generateEmbedding } from "./embedding/openai";
import {
  findMarkdownFiles,
  createMarkdownFileStream,
  processMarkdownFileByChunk
} from "./markdown/loader";
import { markdownToText, chunkText } from "./markdown/parser";
import { parseMarkdownStructure } from "./markdown/semantic-parser";
import { createAdaptiveNodeChunks } from "./markdown/adaptive-chunker";
import { reportMemoryUsage, MemoryTracker } from "./utils/memory-monitor";
import { searchSimilarDocuments, formatSearchResults } from "./search/query";
import * as fs from "fs";
import * as path from "path";

// Default directory for markdown files
const MARKDOWN_DIR = "data/markdown";
// Profile directory for saving memory stats
const PROFILE_OUTPUT_DIR = "profiling_data/semantic_impl_fixed";

/**
 * Process markdown files and add them to the database
 */
async function processMarkdownFiles() {
  // Initialize memory tracker for comprehensive profiling
  const memoryTracker = new MemoryTracker(5000); // Report every 5 seconds
  memoryTracker.measure("startup", true);

  try {
    console.log("Starting ChromaDB with OpenAI embeddings for Markdown files...");
    console.log("Using optimized semantic processing for improved quality and memory efficiency");
    
    // Monitor memory usage
    reportMemoryUsage("startup");

    // 1. Load configuration and environment variables
    const apiKey = getOpenAIApiKey();
    console.log("OpenAI API key loaded successfully");

    // 2. Initialize ChromaDB client and check health
    const client = createChromaClient();
    const isHealthy = await checkChromaHealth(client);

    if (!isHealthy) {
      throw new Error("ChromaDB client is not healthy");
    }
    console.log("ChromaDB client initialized and healthy");

    // 3. Get or create the collection
    const collection = await getOrCreateCollection(client);
    console.log(`Collection '${collection.name}' ready`);

    // 4. Find Markdown files
    const markdownPaths = await findMarkdownFiles(MARKDOWN_DIR);
    console.log(`Found ${markdownPaths.length} Markdown files`);

    if (markdownPaths.length === 0) {
      console.log(`No Markdown files found in ${MARKDOWN_DIR}`);
      return;
    }

    reportMemoryUsage("before_processing");
    memoryTracker.measure("before_processing");
    
    // Create profile directory if it doesn't exist
    if (!fs.existsSync(PROFILE_OUTPUT_DIR)) {
      fs.mkdirSync(PROFILE_OUTPUT_DIR, { recursive: true });
    }
    
    // 5. Process each file using semantic parsing and adaptive chunking
    let totalChunks = 0;
    for (const filePath of markdownPaths) {
      const fileName = path.basename(filePath);
      console.log(`Processing ${filePath} using optimized semantic approach...`);
      memoryTracker.measure(`file_start_${fileName}`);
      
      try {
        // Read file content with stream to reduce memory pressure
        let fileContent = '';
        await processMarkdownFileByChunk(
          filePath,
          4096, // Use slightly larger chunks for more efficient processing
          async (chunk) => {
            fileContent += chunk;
          }
        );
        
        memoryTracker.measure(`file_read_${fileName}`);
        
        // Parse markdown into semantic structure
        const nodes = parseMarkdownStructure(fileContent);
        memoryTracker.measure(`parsing_${fileName}`);
        
        // Help garbage collection
        fileContent = '';
        if (typeof global.gc === 'function') {
          try { global.gc(); } catch (e) {}
        }
        
        // Create adaptive chunks with semantic awareness
        const chunks = createAdaptiveNodeChunks(nodes, {
          source: filePath,
          targetSize: 700,    // Target chunk size
          minSize: 300,       // Minimum chunk size
          maxSize: 1000,      // Maximum chunk size
          overlapSize: 100    // Overlap between chunks
        });
        
        memoryTracker.measure(`chunking_${fileName}`);
        console.log(`Created ${chunks.length} semantic chunks from ${filePath}`);
        totalChunks += chunks.length;
        
        // Process each chunk and generate embeddings - use batching for efficiency
        const BATCH_SIZE = 3; // Process multiple chunks in batches to reduce API calls
        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
          const batchChunks = chunks.slice(i, i + BATCH_SIZE);
          const chunkTexts = batchChunks.map(chunk => chunk.text);
          
          console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(chunks.length/BATCH_SIZE)} from ${filePath}`);
          memoryTracker.measure(`batch_start_${fileName}_${i}`);
          
          // Generate embeddings for the batch
          const embeddings = await generateEmbeddings(chunkTexts);
          
          // Process each chunk in the batch
          const ids = [];
          const documents = [];
          const metadatas = [];
          
          for (let j = 0; j < batchChunks.length; j++) {
            const chunk = batchChunks[j];
            const embedding = embeddings[j];
            
            // Create ID
            const id = `${filePath.replace(/[\/\\]/g, "_")}_chunk_${i+j+1}`;
            chunk.id = id;
            
            ids.push(id);
            documents.push(chunk.text);
            metadatas.push(chunk.metadata);
          }
          
          // Batch upsert into ChromaDB
          await upsertDocuments(collection, ids, documents, embeddings, metadatas);
          console.log(`Upserted batch ${Math.floor(i/BATCH_SIZE) + 1} from ${filePath}`);
          
          memoryTracker.measure(`batch_end_${fileName}_${i}`);
          
          // Add a small delay between batches to allow for GC
          if (i + BATCH_SIZE < chunks.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Help garbage collection
          if (typeof global.gc === 'function') {
            try { global.gc(); } catch (e) {}
          }
        }
        
        // Report memory after each file
        reportMemoryUsage(`after_processing_${filePath}`);
        memoryTracker.measure(`file_end_${fileName}`, true);
        
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        // Continue with next file
      }
    }

    console.log(`All Markdown files processed successfully (${totalChunks} total chunks)`);
    reportMemoryUsage("after_processing_all");
    memoryTracker.measure("after_processing_all", true);
    
    // Export memory tracking data
    const memoryDataFile = path.join(PROFILE_OUTPUT_DIR, `memory_profile_${Date.now()}.json`);
    await memoryTracker.exportToFile(memoryDataFile);
    console.log(`Memory profile saved to: ${memoryDataFile}`);

    // 6. Perform similarity search via CLI
    await performSearch(collection);

  } catch (error) {
    console.error("Error processing markdown files:", error);
    
    // Try to save memory profile even on error
    try {
      const errorFile = path.join(PROFILE_OUTPUT_DIR, `error_profile_${Date.now()}.json`);
      await memoryTracker.exportToFile(errorFile);
      console.log(`Error memory profile saved to: ${errorFile}`);
    } catch (e) {
      console.error("Failed to save error profile:", e);
    }
    
    process.exit(1);
  }
}

/**
 * Perform a search based on user input
 */
async function performSearch(collection: any) {
  // Simple CLI search interface
  console.log("\n=== ChromaDB Markdown Search ===");
  console.log("Enter a search query or type 'exit' to quit");

  // Set up readline interface
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Prompt for search query
  const askQuestion = () => {
    readline.question("\nSearch query: ", async (query: string) => {
      if (query.toLowerCase() === "exit") {
        console.log("Exiting search...");
        readline.close();
        return;
      }

      try {
        console.log(`Searching for: "${query}"`);
        const results = await searchSimilarDocuments(collection, query);
        console.log(formatSearchResults(results));
      } catch (error) {
        console.error("Error performing search:", error);
      }

      // Ask for another query
      askQuestion();
    });
  };

  askQuestion();
}

// Run the main function
processMarkdownFiles();