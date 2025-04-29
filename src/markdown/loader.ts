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