// src/markdown/loader.ts
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { Readable } from "stream";

// Default directory for markdown files
const DEFAULT_MARKDOWN_DIR = "data/markdown";

/**
 * Find all markdown files in the specified directory
 * @param directory Directory to search for markdown files
 * @returns Array of file paths
 */
export async function findMarkdownFiles(directory: string = DEFAULT_MARKDOWN_DIR): Promise<string[]> {
  try {
    // Use glob to find all .md files recursively
    const pattern = path.join(directory, "**/*.md");
    return await glob(pattern);
  } catch (error) {
    console.error(`Error finding markdown files in ${directory}:`, error);
    throw new Error(`Failed to find markdown files: ${error}`);
  }
}

/**
 * Load a markdown file and return its content
 * @param filePath Path to the markdown file
 * @returns Content of the file
 */
export function loadMarkdownFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(`Error loading markdown file ${filePath}:`, error);
    throw new Error(`Failed to load markdown file: ${error}`);
  }
}

/**
 * Create a readable stream for a markdown file
 * @param filePath Path to the markdown file
 * @returns Readable stream
 */
export function createMarkdownFileStream(filePath: string): fs.ReadStream {
  try {
    return createReadStream(filePath, { encoding: 'utf-8' });
  } catch (error) {
    console.error(`Error creating stream for markdown file ${filePath}:`, error);
    throw new Error(`Failed to create stream for markdown file: ${error}`);
  }
}

/**
 * Process a markdown file line by line using streams
 * @param filePath Path to the markdown file
 * @param lineProcessor Function to process each line
 * @returns Promise that resolves when processing is complete
 */
export async function processMarkdownFileByLine(
  filePath: string,
  lineProcessor: (line: string) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const fileStream = createMarkdownFileStream(filePath);
      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        lineProcessor(line);
      });

      rl.on('close', () => {
        resolve();
      });

      rl.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Process a markdown file in chunks using streams
 * @param filePath Path to the markdown file
 * @param chunkSize Size of each chunk in bytes
 * @param chunkProcessor Function to process each chunk
 * @returns Promise that resolves when processing is complete
 */
export async function processMarkdownFileByChunk(
  filePath: string,
  chunkSize: number,
  chunkProcessor: (chunk: string) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const fileStream = createMarkdownFileStream(filePath);
      let buffer = '';

      fileStream.on('data', async (chunk: string) => {
        fileStream.pause(); // Pause the stream while processing

        buffer += chunk;

        // Process complete chunks
        while (buffer.length >= chunkSize) {
          const processChunk = buffer.slice(0, chunkSize);
          buffer = buffer.slice(chunkSize);

          try {
            await chunkProcessor(processChunk);
          } catch (error) {
            fileStream.destroy();
            reject(error);
            return;
          }
        }

        fileStream.resume(); // Resume the stream after processing
      });

      fileStream.on('end', async () => {
        // Process any remaining data
        if (buffer.length > 0) {
          try {
            await chunkProcessor(buffer);
          } catch (error) {
            reject(error);
            return;
          }
        }
        resolve();
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Load multiple markdown files
 * @param filePaths Array of file paths
 * @returns Array of objects containing file path and content
 */
export function loadMarkdownFiles(filePaths: string[]): Array<{ path: string; content: string }> {
  return filePaths.map(filePath => ({
    path: filePath,
    content: loadMarkdownFile(filePath)
  }));
}
