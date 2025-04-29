// src/markdown/loader.ts
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

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
