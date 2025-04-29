// src/markdown/parser.ts
import MarkdownIt from "markdown-it";

// Initialize markdown parser
const md = new MarkdownIt();

// Default chunk size (in characters)
const DEFAULT_CHUNK_SIZE = 1000;
// Default chunk overlap (in characters)
const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * Convert markdown to plain text
 * @param markdown Markdown content
 * @returns Plain text
 */
export function markdownToText(markdown: string): string {
  // Render markdown to HTML
  const html = md.render(markdown);

  // Remove HTML tags to get plain text
  const text = html.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

/**
 * Split text into chunks of specified size with overlap
 * @param text Text to chunk
 * @param chunkSize Maximum size of each chunk
 * @param overlap Overlap between chunks
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlap: number = DEFAULT_CHUNK_OVERLAP
): string[] {
  const chunks: string[] = [];

  if (text.length <= chunkSize) {
    chunks.push(text);
    return chunks;
  }

  let startIndex = 0;

  while (startIndex < text.length) {
    // Calculate end index for current chunk
    let endIndex = startIndex + chunkSize;

    // If we're not at the end of the text, try to find a good break point
    if (endIndex < text.length) {
      // Look for a space to break at
      const spaceIndex = text.lastIndexOf(" ", endIndex);
      if (spaceIndex > startIndex) {
        endIndex = spaceIndex;
      }
    } else {
      endIndex = text.length;
    }

    // Add the chunk
    chunks.push(text.substring(startIndex, endIndex).trim());

    // Move start index for next chunk, accounting for overlap
    startIndex = endIndex - overlap;

    // Make sure we're making progress
    if (startIndex <= 0 || startIndex >= text.length) {
      break;
    }
  }

  return chunks;
}

/**
 * Process markdown content: convert to text and split into chunks
 * @param markdown Markdown content
 * @param chunkSize Maximum size of each chunk
 * @param overlap Overlap between chunks
 * @returns Array of text chunks
 */
export function processMarkdown(
  markdown: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlap: number = DEFAULT_CHUNK_OVERLAP
): string[] {
  const text = markdownToText(markdown);
  return chunkText(text, chunkSize, overlap);
}
