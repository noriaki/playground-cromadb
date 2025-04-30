// src/markdown/adaptive-chunker.ts
import { MarkdownNode, getHeadingPath } from './semantic-parser';

/**
 * Options for adaptive chunking
 */
export interface AdaptiveChunkOptions {
  targetSize?: number;      // Target chunk size in characters
  minSize?: number;         // Minimum chunk size in characters
  maxSize?: number;         // Maximum chunk size in characters
  overlapSize?: number;     // Overlap size between chunks in characters
  respectSemantics?: boolean; // Whether to respect semantic boundaries
  expandHeadings?: boolean; // Whether to include heading context
}

/**
 * Result of chunking process containing text and metadata
 */
export interface ChunkResult {
  text: string;
  metadata: {
    source?: string;
    headingPath?: string[];
    position?: {
      start: number;
      end: number;
    };
    contentTypes?: string[];
    previousChunkId?: string;
    nextChunkId?: string;
    chunkIndex: number;
    totalChunks?: number;
  };
  id?: string;
  embedding?: number[];
}

/**
 * Creates adaptive chunks from markdown text, respecting semantic boundaries
 * @param text The markdown text to chunk
 * @param options Chunking options
 * @returns Array of chunks
 */
export function createAdaptiveTextChunks(
  text: string,
  options: AdaptiveChunkOptions = {}
): string[] {
  const {
    targetSize = 700,
    minSize = 300,
    maxSize = 1000,
    overlapSize = 100,
    respectSemantics = true
  } = options;
  
  // Don't chunk small text
  if (text.length <= maxSize) {
    return [text];
  }
  
  const chunks: string[] = [];
  let currentPosition = 0;
  
  while (currentPosition < text.length) {
    // Calculate target end position
    let endPosition = currentPosition + targetSize;
    
    // Don't go beyond text length
    endPosition = Math.min(endPosition, text.length);
    
    // If we're at the end, just add the remaining text
    if (endPosition === text.length) {
      const chunk = text.substring(currentPosition);
      if (chunk.length >= minSize) {
        chunks.push(chunk);
      } else if (chunks.length > 0) {
        // If last chunk is too small, merge with previous chunk
        const lastChunk = chunks.pop()!;
        chunks.push(lastChunk + chunk);
      } else {
        chunks.push(chunk); // Only chunk, add it regardless of size
      }
      break;
    }
    
    // Find the best split point between min and max size
    const minValidEnd = currentPosition + minSize;
    const maxValidEnd = Math.min(currentPosition + maxSize, text.length);
    
    let splitPosition = findBestSplitPosition(
      text, minValidEnd, maxValidEnd, respectSemantics
    );
    
    // Create chunk
    const chunk = text.substring(currentPosition, splitPosition);
    chunks.push(chunk);
    
    // Move current position for next chunk, accounting for overlap
    currentPosition = Math.max(splitPosition - overlapSize, currentPosition + minSize / 2);
  }
  
  return chunks;
}

/**
 * Finds the best position to split text, respecting semantic boundaries
 * @param text The text to split
 * @param minPosition Minimum valid split position
 * @param maxPosition Maximum valid split position
 * @param respectSemantics Whether to respect semantic boundaries
 * @returns The best position to split at
 */
function findBestSplitPosition(
  text: string,
  minPosition: number,
  maxPosition: number,
  respectSemantics: boolean
): number {
  // If we don't care about semantics, just use the max position
  if (!respectSemantics) {
    return maxPosition;
  }
  
  // Boundaries in descending order of preference
  const boundaries = [
    // Paragraph breaks
    { pattern: /\n\n/g, score: 100 },
    // Sentence endings
    { pattern: /[.!?]\s+[A-Z]/g, score: 80 },
    // End of list items
    { pattern: /\n[-*+]\s+|\n\d+\.\s+/g, score: 60 },
    // Commas and semicolons
    { pattern: /[,;]\s+/g, score: 40 },
    // Any whitespace
    { pattern: /\s+/g, score: 20 }
  ];
  
  let bestPosition = maxPosition;
  let bestScore = -1;
  
  // Search for each boundary type
  for (const { pattern, score } of boundaries) {
    // Reset the regex for each search
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const position = match.index + match[0].length - 1;
      
      // Check if position is within valid range
      if (position >= minPosition && position <= maxPosition) {
        // Calculate score based on centrality and boundary type
        // Prefer positions closer to the target size
        const centralityScore = 1 - Math.abs(position - (minPosition + maxPosition) / 2) / (maxPosition - minPosition);
        const totalScore = score + centralityScore * 20;
        
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestPosition = position;
        }
      }
      
      // Stop searching if we're beyond the maximum position
      if (match.index > maxPosition) break;
    }
    
    // If we found a good boundary, stop searching
    if (bestScore >= 70) break;
  }
  
  return bestPosition;
}

/**
 * Creates adaptive chunks from markdown nodes, respecting semantic structure
 * @param nodes Array of markdown nodes
 * @param options Chunking options
 * @returns Array of chunks with metadata
 */
export function createAdaptiveNodeChunks(
  nodes: MarkdownNode[],
  options: AdaptiveChunkOptions & {
    source?: string;
  } = {}
): ChunkResult[] {
  const {
    targetSize = 700,
    minSize = 300,
    maxSize = 1000,
    overlapSize = 100,
    expandHeadings = true,
    source
  } = options;
  
  const chunks: ChunkResult[] = [];
  
  // Flatten nodes for processing
  const flatNodes = flattenNodesWithContext(nodes);
  
  let currentChunk: {
    text: string;
    nodes: MarkdownNode[];
    headingPath: string[];
    contentTypes: Set<string>;
    startPosition: number;
    endPosition: number;
  } = {
    text: '',
    nodes: [],
    headingPath: [],
    contentTypes: new Set(),
    startPosition: 0,
    endPosition: 0
  };
  
  // Process each node
  for (let i = 0; i < flatNodes.length; i++) {
    const { node, headingPath } = flatNodes[i];
    const nodeText = node.content;
    
    // Skip empty nodes
    if (!nodeText.trim()) continue;
    
    // Update current heading path
    currentChunk.headingPath = [...headingPath];
    
    // Check if adding this node would exceed max size
    if (currentChunk.text.length + nodeText.length > maxSize && currentChunk.text.length >= minSize) {
      // Finalize current chunk
      finalizeChunk();
    }
    
    // Add node to current chunk
    currentChunk.text += (currentChunk.text ? '\n\n' : '') + nodeText;
    currentChunk.nodes.push(node);
    currentChunk.contentTypes.add(node.type);
    
    // Update position tracking
    if (currentChunk.nodes.length === 1) {
      currentChunk.startPosition = node.position.start;
    }
    currentChunk.endPosition = node.position.end;
    
    // Check if current chunk is at or above target size
    if (currentChunk.text.length >= targetSize && i < flatNodes.length - 1) {
      finalizeChunk();
    }
  }
  
  // Add any remaining content as the last chunk
  if (currentChunk.text.length > 0) {
    finalizeChunk();
  }
  
  // Add previous/next chunk references
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) {
      chunks[i].metadata.previousChunkId = `chunk_${i-1}`;
    }
    if (i < chunks.length - 1) {
      chunks[i].metadata.nextChunkId = `chunk_${i+1}`;
    }
    
    chunks[i].metadata.totalChunks = chunks.length;
    chunks[i].id = `chunk_${i}`;
  }
  
  return chunks;
  
  /**
   * Helper function to finalize the current chunk and start a new one
   */
  function finalizeChunk() {
    const chunkIndex = chunks.length;
    
    chunks.push({
      text: currentChunk.text,
      metadata: {
        source,
        headingPath: currentChunk.headingPath,
        position: {
          start: currentChunk.startPosition,
          end: currentChunk.endPosition
        },
        contentTypes: Array.from(currentChunk.contentTypes),
        chunkIndex
      }
    });
    
    // Start new chunk with overlap
    const overlapText = findOverlapText(currentChunk.text, overlapSize);
    
    currentChunk = {
      text: overlapText,
      nodes: [],
      headingPath: [...currentChunk.headingPath],
      contentTypes: new Set(),
      startPosition: currentChunk.endPosition - overlapText.length,
      endPosition: currentChunk.endPosition
    };
  }
}

/**
 * Finds appropriate text to use for overlap between chunks
 * @param text The current chunk text
 * @param desiredOverlapSize Desired overlap size
 * @returns Text to use for overlap
 */
function findOverlapText(text: string, desiredOverlapSize: number): string {
  // If text is shorter than desired overlap, use entire text
  if (text.length <= desiredOverlapSize) {
    return text;
  }
  
  // Try to find a sentence boundary within the desired overlap size
  const endPortion = text.slice(-desiredOverlapSize * 2);
  const sentenceBoundary = endPortion.search(/[.!?]\s+[A-Z]/);
  
  if (sentenceBoundary !== -1 && endPortion.length - sentenceBoundary <= desiredOverlapSize) {
    return endPortion.slice(sentenceBoundary + 2); // +2 to include the punctuation and space
  }
  
  // Otherwise just use the last part of the text
  return text.slice(-desiredOverlapSize);
}

/**
 * Flattens nodes with their heading context
 * @param nodes The nodes to flatten
 * @param currentPath Current heading path
 * @returns Flattened nodes with heading paths
 */
function flattenNodesWithContext(
  nodes: MarkdownNode[],
  currentPath: string[] = []
): Array<{node: MarkdownNode, headingPath: string[]}> {
  const result: Array<{node: MarkdownNode, headingPath: string[]}> = [];
  
  for (const node of nodes) {
    // Update heading path if this is a heading
    let nodePath = [...currentPath];
    if (node.type === 'heading') {
      // For headings of level 1, reset the path
      if (node.level === 1) {
        nodePath = [node.content];
      } else {
        // For other headings, add to current path
        // First remove any higher level headings
        while (nodePath.length >= node.level! - 1) {
          nodePath.pop();
        }
        nodePath.push(node.content);
      }
    }
    
    // Add node with its context
    result.push({
      node,
      headingPath: nodePath
    });
    
    // Process children if any
    if (node.children && node.children.length > 0) {
      result.push(...flattenNodesWithContext(node.children, nodePath));
    }
  }
  
  return result;
}