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
import { processMarkdown, markdownToText, chunkText } from "./markdown/parser";
import { searchSimilarDocuments, formatSearchResults } from "./search/query";
import * as fs from "fs";

// Default directory for markdown files
const MARKDOWN_DIR = "data/markdown";

/**
 * Process markdown files and add them to the database
 */
async function processMarkdownFiles() {
  try {
    console.log("Starting ChromaDB with OpenAI embeddings for Markdown files...");
    console.log("Using memory-optimized streaming approach to prevent heap errors");

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

    // 5. Process each file using streaming approach
    for (const filePath of markdownPaths) {
      console.log(`Processing ${filePath} using streaming approach...`);

      // Process file in chunks to avoid loading entire file into memory
      let fileContent = '';
      let chunkCounter = 0;

      // Define chunk processing function
      const processFileChunk = async (chunk: string) => {
        // Accumulate content
        fileContent += chunk;

        // When we have enough content, process it
        if (fileContent.length >= 5000) { // Process in 5KB chunks
          // Convert markdown to text
          const text = markdownToText(fileContent);

          // Create smaller chunks for embedding
          const textChunks = chunkText(text);
          console.log(`Created ${textChunks.length} text chunks from file chunk`);

          // Process each text chunk individually to minimize memory usage
          for (const textChunk of textChunks) {
            try {
              // Generate embedding for single chunk
              console.log(`Processing text chunk ${++chunkCounter} from ${filePath}`);
              const embedding = await generateEmbedding(textChunk);

              // Create ID and metadata
              const id = `${filePath.replace(/[\/\\]/g, "_")}_chunk_${chunkCounter}`;
              const metadata = { source: filePath };

              // Upsert single chunk into ChromaDB
              await upsertDocuments(collection, [id], [textChunk], [embedding], [metadata]);
              console.log(`Upserted chunk ${chunkCounter} from ${filePath}`);

              // Explicitly help garbage collection
              // Note: We can't modify string length, but we can dereference it
              // Let the variables be garbage collected naturally

              // Add a small delay to allow for GC
              await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
              console.error(`Error processing text chunk ${chunkCounter}:`, error);
              throw error;
            }
          }

          // Reset accumulated content but keep a small overlap
          const overlapSize = 200;
          fileContent = fileContent.slice(-overlapSize);

          // Explicitly help garbage collection
          textChunks.length = 0;
          // Try to force garbage collection if available
          if (typeof global.gc === 'function') {
            try {
              global.gc();
            } catch (e) {
              // Ignore if gc is not available
            }
          }
        }
      };

      // Process the file using streaming
      try {
        await processMarkdownFileByChunk(filePath, 1024, processFileChunk);

        // Process any remaining content
        if (fileContent.length > 0) {
          const text = markdownToText(fileContent);
          const textChunks = chunkText(text);

          for (const textChunk of textChunks) {
            const embedding = await generateEmbedding(textChunk);
            const id = `${filePath.replace(/[\/\\]/g, "_")}_chunk_${++chunkCounter}`;
            const metadata = { source: filePath };
            await upsertDocuments(collection, [id], [textChunk], [embedding], [metadata]);
            console.log(`Upserted final chunk ${chunkCounter} from ${filePath}`);
          }
        }

        console.log(`Completed processing ${filePath} with ${chunkCounter} total chunks`);

        // Explicitly help garbage collection
        fileContent = '';
        // Try to force garbage collection if available
        if (typeof global.gc === 'function') {
          try {
            global.gc();
          } catch (e) {
            // Ignore if gc is not available
          }
        }

      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        throw error;
      }
    }

    console.log("All Markdown files processed successfully");

    // 6. Perform similarity search via CLI
    await performSearch(collection);

  } catch (error) {
    console.error("Error processing markdown files:", error);
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
