// src/processor.ts
import { getOpenAIApiKey } from "./config";
import { createChromaClient, checkChromaHealth } from "./db/chroma-client";
import { getOrCreateCollection, upsertDocuments } from "./db/collections";
import { generateEmbeddings } from "./embedding/openai";
import { findMarkdownFiles, processMarkdownFileByChunk } from "./markdown/loader";
import { parseMarkdownStructure } from "./markdown/semantic-parser";
import { createAdaptiveNodeChunks } from "./markdown/adaptive-chunker";
import { reportMemoryUsage } from "./utils/memory-monitor";
import * as path from "path";
import * as os from "os";

// Default directory for markdown files
const MARKDOWN_DIR = "data/markdown";

// Maximum number of files to process in parallel
// Default to number of CPU cores minus 1 (to leave one core for system operations)
const MAX_PARALLEL_FILES = Math.max(1, os.cpus().length - 1);

// Maximum number of chunks to process in a single batch for ChromaDB upsert
const MAX_CHROMADB_BATCH_SIZE = 20;

/**
 * Process markdown files and add them to the database
 */
export async function processMarkdownFiles() {
  try {
    console.log("Starting ChromaDB with OpenAI embeddings for Markdown files...");
    console.log("Using optimized semantic processing for improved quality");

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

    // 5. Process files in parallel using semantic parsing and adaptive chunking
    let totalChunks = 0;
    console.log(`Using parallel processing with up to ${MAX_PARALLEL_FILES} concurrent files`);

    // Process files in batches to control parallelism
    for (let i = 0; i < markdownPaths.length; i += MAX_PARALLEL_FILES) {
      const fileBatch = markdownPaths.slice(i, i + MAX_PARALLEL_FILES);
      console.log(`Processing batch of ${fileBatch.length} files (${i+1}-${Math.min(i+MAX_PARALLEL_FILES, markdownPaths.length)} of ${markdownPaths.length})`);

      // Process each file in the batch in parallel
      const fileResults = await Promise.all(fileBatch.map(async (filePath) => {
        const fileName = path.basename(filePath);
        console.log(`Processing ${filePath} using optimized semantic approach...`);

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

          // Parse markdown into semantic structure
          const nodes = parseMarkdownStructure(fileContent);

          // Help garbage collection
          fileContent = '';

          // Create adaptive chunks with semantic awareness
          const chunks = createAdaptiveNodeChunks(nodes, {
            source: filePath,
            targetSize: 700,    // Target chunk size
            minSize: 300,       // Minimum chunk size
            maxSize: 1000,      // Maximum chunk size
            overlapSize: 100    // Overlap between chunks
          });

          console.log(`Created ${chunks.length} semantic chunks from ${filePath}`);

          // Return the chunks for further processing
          return {
            filePath,
            chunks,
            success: true
          };
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error);
          // Return error information
          return {
            filePath,
            chunks: [],
            success: false,
            error
          };
        }
      }));

      // Collect all chunks from successfully processed files
      const allChunks = fileResults
        .filter(result => result.success && result.chunks.length > 0)
        .flatMap(result => result.chunks.map(chunk => ({
          ...chunk,
          filePath: result.filePath
        })));

      totalChunks += allChunks.length;
      console.log(`Collected ${allChunks.length} chunks from batch of ${fileBatch.length} files`);

      // Process chunks in optimized batches for embedding generation and DB upsert
      // Use larger batch sizes for efficiency while staying within limits
      const EMBEDDING_BATCH_SIZE = 8; // Starting batch size, will be adjusted dynamically

      // Group chunks into batches for processing
      for (let j = 0; j < allChunks.length; j += MAX_CHROMADB_BATCH_SIZE) {
        const chunkBatch = allChunks.slice(j, j + MAX_CHROMADB_BATCH_SIZE);
        const chunkTexts = chunkBatch.map(chunk => chunk.text);

        console.log(`Processing chunk batch ${Math.floor(j/MAX_CHROMADB_BATCH_SIZE) + 1}/${Math.ceil(allChunks.length/MAX_CHROMADB_BATCH_SIZE)} with ${chunkBatch.length} chunks`);

        // Generate embeddings for the batch with dynamic batch sizing
        const embeddings = await generateEmbeddings(chunkTexts, EMBEDDING_BATCH_SIZE);

        // Prepare data for ChromaDB upsert
        const ids: string[] = [];
        const documents: string[] = [];
        const metadatas: Record<string, any>[] = [];

        for (let k = 0; k < chunkBatch.length; k++) {
          const chunk = chunkBatch[k];
          if (!chunk) continue;

          // Create ID
          const id = `${chunk.filePath.replace(/[\/\\]/g, "_")}_chunk_${j+k+1}`;
          chunk.id = id;

          ids.push(id);
          documents.push(chunk.text);
          metadatas.push(chunk.metadata);
        }

        // Batch upsert into ChromaDB
        await upsertDocuments(collection, ids, documents, embeddings, metadatas);
        console.log(`Upserted batch ${Math.floor(j/MAX_CHROMADB_BATCH_SIZE) + 1}/${Math.ceil(allChunks.length/MAX_CHROMADB_BATCH_SIZE)}`);

        // Check memory usage and run GC if needed
        const memoryUsage = process.memoryUsage();
        const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

        if (heapUsedPercent > 70 && typeof global.gc === 'function') {
          console.log(`Running garbage collection due to high memory usage (${Math.round(heapUsedPercent)}%)`);
          try { global.gc(); } catch (e) {}
        }
      }

      // Report memory usage after processing a batch of files
      reportMemoryUsage(`After processing batch ${Math.floor(i/MAX_PARALLEL_FILES) + 1}`);
    }

    console.log(`All Markdown files processed successfully (${totalChunks} total chunks)`);
    return collection;

  } catch (error) {
    console.error("Error processing markdown files:", error);
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  processMarkdownFiles();
}
