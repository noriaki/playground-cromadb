// src/index.ts
import { getOpenAIApiKey } from "./config";
import { createChromaClient, checkChromaHealth } from "./db/chroma-client";
import { getOrCreateCollection, upsertDocuments } from "./db/collections";
import { generateEmbeddings } from "./embedding/openai";
import { findMarkdownFiles, loadMarkdownFiles } from "./markdown/loader";
import { processMarkdown } from "./markdown/parser";
import { searchSimilarDocuments, formatSearchResults } from "./search/query";

// Default directory for markdown files
const MARKDOWN_DIR = "data/markdown";

/**
 * Process markdown files and add them to the database
 */
async function processMarkdownFiles() {
  try {
    console.log("Starting ChromaDB with OpenAI embeddings for Markdown files...");

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

    // 4. Load, parse, and chunk Markdown files
    const markdownPaths = await findMarkdownFiles(MARKDOWN_DIR);
    console.log(`Found ${markdownPaths.length} Markdown files`);

    if (markdownPaths.length === 0) {
      console.log(`No Markdown files found in ${MARKDOWN_DIR}`);
      return;
    }

    const markdownFiles = loadMarkdownFiles(markdownPaths);
    console.log("Markdown files loaded successfully");

    // Process each file
    for (const file of markdownFiles) {
      console.log(`Processing ${file.path}...`);

      // Parse and chunk the markdown
      const chunks = processMarkdown(file.content);
      console.log(`Created ${chunks.length} chunks from ${file.path}`);

      if (chunks.length === 0) {
        continue;
      }

      // 5. Vectorize text using OpenAI
      console.log("Generating embeddings...");
      const embeddings = await generateEmbeddings(chunks);

      // Create IDs and metadata for each chunk
      const ids = chunks.map((_, index) => `${file.path.replace(/[\/\\]/g, "_")}_chunk_${index}`);
      const metadatas = chunks.map(() => ({ source: file.path }));

      // 6. Upsert into ChromaDB
      await upsertDocuments(collection, ids, chunks, embeddings, metadatas);
      console.log(`Upserted ${chunks.length} chunks from ${file.path} into ChromaDB`);
    }

    console.log("All Markdown files processed successfully");

    // 7. Perform similarity search via CLI
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
