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