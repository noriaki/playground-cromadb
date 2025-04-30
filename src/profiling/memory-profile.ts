// src/profiling/memory-profile.ts

import { reportMemoryUsage, MemoryTracker } from '../utils/memory-monitor';
import { getOpenAIApiKey } from "../config";
import { createChromaClient, checkChromaHealth } from "../db/chroma-client";
import { getOrCreateCollection, upsertDocuments } from "../db/collections";
import { generateEmbedding } from "../embedding/openai";
import { findMarkdownFiles, processMarkdownFileByChunk } from "../markdown/loader";
import { markdownToText, chunkText } from "../markdown/parser";
import { parseMarkdownStructure } from "../markdown/semantic-parser";
import { createAdaptiveNodeChunks } from "../markdown/adaptive-chunker";
import * as fs from 'fs';
import * as path from 'path';

// Default directory for markdown files
const MARKDOWN_DIR = "data/markdown";
// Output directory for profiling data
const PROFILE_OUTPUT_DIR = "profiling_data";

/**
 * Main profiling function
 */
async function runMemoryProfiler() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(PROFILE_OUTPUT_DIR)) {
    fs.mkdirSync(PROFILE_OUTPUT_DIR, { recursive: true });
  }
  
  // Initialize memory tracker
  const memoryTracker = new MemoryTracker(2000); // Report every 2 seconds
  
  try {
    console.log("Starting memory profiling for Markdown processing...");
    reportMemoryUsage("startup");
    memoryTracker.measure("startup", true);
    
    // Phase 1: Configuration and initialization
    console.log("\n=== Phase 1: Initialization ===");
    memoryTracker.measure("phase1_start");
    
    const apiKey = getOpenAIApiKey();
    console.log("OpenAI API key loaded");
    
    const client = createChromaClient();
    const isHealthy = await checkChromaHealth(client);
    
    if (!isHealthy) {
      throw new Error("ChromaDB client is not healthy");
    }
    console.log("ChromaDB client initialized and healthy");
    
    const collection = await getOrCreateCollection(client);
    console.log(`Collection '${collection.name}' ready`);
    
    memoryTracker.measure("phase1_end", true);
    
    // Phase 2: Finding Markdown files
    console.log("\n=== Phase 2: Finding Markdown Files ===");
    memoryTracker.measure("phase2_start");
    
    const markdownPaths = await findMarkdownFiles(MARKDOWN_DIR);
    console.log(`Found ${markdownPaths.length} Markdown files`);
    
    memoryTracker.measure("phase2_end", true);
    
    if (markdownPaths.length === 0) {
      console.log(`No Markdown files found in ${MARKDOWN_DIR}`);
      return;
    }
    
    // Track processing stats for all files
    const fileStats: Record<string, any>[] = [];
    
    // Process a subset of files for profiling (to keep the profiling run shorter)
    const filesToProcess = markdownPaths.slice(0, 3); // Process first 3 files
    
    // Optionally, process the largest file to test worst-case scenarios
    filesToProcess.push(...findLargestFiles(markdownPaths, 1));
    
    // Remove duplicates
    const uniqueFilesToProcess = [...new Set(filesToProcess)];
    
    // Phase 3: Process each file with different strategies and measure
    console.log(`\n=== Phase 3: Processing ${uniqueFilesToProcess.length} Files with Different Strategies ===`);
    
    for (const filePath of uniqueFilesToProcess) {
      const fileName = path.basename(filePath);
      console.log(`\nProcessing ${fileName}`);
      
      // File stats object
      const stats: Record<string, any> = {
        fileName,
        filePath,
        fileSize: fs.statSync(filePath).size,
        strategies: {}
      };
      
      // Strategy 1: Original approach (load full file)
      console.log("Strategy 1: Original approach - Load full file");
      memoryTracker.measure(`strategy1_${fileName}_start`);
      
      try {
        const strategy1Start = Date.now();
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const text = markdownToText(fileContent);
        const chunks = chunkText(text);
        
        console.log(`Created ${chunks.length} chunks using original approach`);
        stats.strategies.original = {
          chunkCount: chunks.length,
          processingTime: Date.now() - strategy1Start,
          success: true
        };
        
        memoryTracker.measure(`strategy1_${fileName}_end`, true);
      } catch (error) {
        console.error(`Error in Strategy 1 for ${fileName}:`, error);
        stats.strategies.original = {
          error: error.message,
          success: false
        };
      }
      
      // Try to force garbage collection
      memoryTracker.requestGC();
      
      // Strategy 2: Streaming approach
      console.log("Strategy 2: Streaming approach");
      memoryTracker.measure(`strategy2_${fileName}_start`);
      
      try {
        const strategy2Start = Date.now();
        let chunkCounter = 0;
        let fileContent = '';
        
        const processFileChunk = async (chunk: string) => {
          fileContent += chunk;
          
          // Process when we have enough content
          if (fileContent.length >= 5000) {
            const text = markdownToText(fileContent);
            const textChunks = chunkText(text);
            chunkCounter += textChunks.length;
            
            // Reset accumulated content but keep small overlap
            const overlapSize = 200;
            fileContent = fileContent.slice(-overlapSize);
          }
        };
        
        await processMarkdownFileByChunk(filePath, 1024, processFileChunk);
        
        // Process any remaining content
        if (fileContent.length > 0) {
          const text = markdownToText(fileContent);
          const textChunks = chunkText(text);
          chunkCounter += textChunks.length;
        }
        
        console.log(`Created ${chunkCounter} chunks using streaming approach`);
        stats.strategies.streaming = {
          chunkCount: chunkCounter,
          processingTime: Date.now() - strategy2Start,
          success: true
        };
        
        memoryTracker.measure(`strategy2_${fileName}_end`, true);
      } catch (error) {
        console.error(`Error in Strategy 2 for ${fileName}:`, error);
        stats.strategies.streaming = {
          error: error.message,
          success: false
        };
      }
      
      // Try to force garbage collection
      memoryTracker.requestGC();
      
      // Strategy 3: Semantic chunking approach
      console.log("Strategy 3: Semantic chunking approach");
      memoryTracker.measure(`strategy3_${fileName}_start`);
      
      try {
        const strategy3Start = Date.now();
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Parse into semantic structure
        const nodes = parseMarkdownStructure(fileContent);
        
        // Create adaptive chunks
        const adaptiveChunks = createAdaptiveNodeChunks(nodes, {
          source: filePath,
          targetSize: 700,
          minSize: 300,
          maxSize: 1000
        });
        
        console.log(`Created ${adaptiveChunks.length} chunks using semantic approach`);
        stats.strategies.semantic = {
          chunkCount: adaptiveChunks.length,
          processingTime: Date.now() - strategy3Start,
          success: true
        };
        
        memoryTracker.measure(`strategy3_${fileName}_end`, true);
      } catch (error) {
        console.error(`Error in Strategy 3 for ${fileName}:`, error);
        stats.strategies.semantic = {
          error: error.message,
          success: false
        };
      }
      
      // Try to force garbage collection
      memoryTracker.requestGC();
      
      // Add file stats to overall stats
      fileStats.push(stats);
    }
    
    // Phase 4: Test embedding generation (optional)
    if (process.env.TEST_EMBEDDINGS === 'true') {
      console.log("\n=== Phase 4: Testing Embedding Generation ===");
      memoryTracker.measure("phase4_start");
      
      try {
        // Use a sample file for embedding test
        const sampleFilePath = uniqueFilesToProcess[0];
        const fileContent = fs.readFileSync(sampleFilePath, 'utf-8');
        const nodes = parseMarkdownStructure(fileContent);
        const chunks = createAdaptiveNodeChunks(nodes, { source: sampleFilePath });
        
        console.log(`Generated ${chunks.length} chunks for embedding test`);
        
        // Process first few chunks for embeddings
        const embeddingTestChunks = chunks.slice(0, 3);
        
        for (let i = 0; i < embeddingTestChunks.length; i++) {
          const chunk = embeddingTestChunks[i];
          console.log(`Generating embedding for chunk ${i+1}/${embeddingTestChunks.length}`);
          
          memoryTracker.measure(`embedding_chunk${i+1}_start`);
          const embedding = await generateEmbedding(chunk.text);
          memoryTracker.measure(`embedding_chunk${i+1}_end`);
          
          // Simulate database insertion
          const id = `test_${i}`;
          await upsertDocuments(collection, [id], [chunk.text], [embedding], [chunk.metadata]);
          
          console.log(`Embedding generated and stored for chunk ${i+1}`);
          memoryTracker.requestGC();
        }
      } catch (error) {
        console.error("Error in embedding test:", error);
      }
      
      memoryTracker.measure("phase4_end", true);
    }
    
    // Phase 5: Generate final report
    console.log("\n=== Phase 5: Generating Report ===");
    
    // Export memory tracking data
    const memoryDataFile = path.join(PROFILE_OUTPUT_DIR, `memory_profile_${Date.now()}.json`);
    await memoryTracker.exportToFile(memoryDataFile);
    
    // Export file processing stats
    const statsFile = path.join(PROFILE_OUTPUT_DIR, `processing_stats_${Date.now()}.json`);
    fs.writeFileSync(statsFile, JSON.stringify(fileStats, null, 2));
    
    // Print summary to console
    console.log("\n=== Memory Profiling Summary ===");
    console.log(`Processed ${uniqueFilesToProcess.length} files with 3 different strategies`);
    console.log(`Memory measurements saved to: ${memoryDataFile}`);
    console.log(`Processing statistics saved to: ${statsFile}`);
    
    // Final memory report
    reportMemoryUsage("final");
    
  } catch (error) {
    console.error("Error during memory profiling:", error);
    
    // Even on error, try to save the data we've collected
    try {
      const errorFile = path.join(PROFILE_OUTPUT_DIR, `error_profile_${Date.now()}.json`);
      await memoryTracker.exportToFile(errorFile);
      console.log(`Partial memory data saved to: ${errorFile}`);
    } catch (e) {
      console.error("Failed to save error profile:", e);
    }
  }
}

/**
 * Find the largest files in a list of file paths
 * @param filePaths Array of file paths
 * @param count Number of largest files to return
 * @returns Array of largest file paths
 */
function findLargestFiles(filePaths: string[], count: number): string[] {
  return filePaths
    .map(path => ({ path, size: fs.statSync(path).size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, count)
    .map(file => file.path);
}

// Execute the memory profiler
runMemoryProfiler().then(() => {
  console.log("Memory profiling complete");
  process.exit(0);
}).catch(error => {
  console.error("Memory profiling failed:", error);
  process.exit(1);
});