// src/markdown/semantic-parser.ts

/**
 * Represents a node in the Markdown document structure
 */
export interface MarkdownNode {
  type: 'heading' | 'paragraph' | 'list' | 'codeblock' | 'blockquote' | 'table' | 'horizontal_rule';
  level?: number; // For headings (1-6)
  content: string;
  raw: string; // Original markdown content
  position: {
    start: number;
    end: number;
  };
  parent?: MarkdownNode;
  children?: MarkdownNode[];
  metadata?: Record<string, any>;
}

/**
 * Parse Markdown text into a structured tree of nodes based on semantic elements
 * @param markdown The markdown text to parse
 * @returns Array of MarkdownNode objects representing the document structure
 */
export function parseMarkdownStructure(markdown: string): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  let currentPosition = 0;

  // Split markdown by double newlines to get blocks
  const blocks = markdown.split(/\n\n+/);
  
  for (const block of blocks) {
    if (!block.trim()) continue; // Skip empty blocks
    
    const startPosition = markdown.indexOf(block, currentPosition);
    const endPosition = startPosition + block.length;
    currentPosition = endPosition;
    
    // Determine block type and create appropriate node
    const node = createNodeFromBlock(block, startPosition, endPosition);
    if (node) {
      nodes.push(node);
    }
  }

  // Build parent-child relationships based on heading hierarchy
  return buildHierarchy(nodes);
}

/**
 * Creates a MarkdownNode from a block of text
 * @param block The markdown block text
 * @param start Start position in the original text
 * @param end End position in the original text
 * @returns A MarkdownNode object representing the block
 */
function createNodeFromBlock(block: string, start: number, end: number): MarkdownNode | null {
  const trimmedBlock = block.trim();
  if (!trimmedBlock) return null;
  
  // Check for headings
  const headingMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/m);
  if (headingMatch) {
    return {
      type: 'heading',
      level: headingMatch[1].length,
      content: headingMatch[2].trim(),
      raw: block,
      position: { start, end }
    };
  }
  
  // Check for code blocks
  if (trimmedBlock.startsWith('```') && trimmedBlock.endsWith('```')) {
    return {
      type: 'codeblock',
      content: trimmedBlock.substring(
        trimmedBlock.indexOf('\n') + 1, 
        trimmedBlock.lastIndexOf('```')
      ).trim(),
      raw: block,
      position: { start, end }
    };
  }
  
  // Check for blockquotes
  if (trimmedBlock.startsWith('>')) {
    return {
      type: 'blockquote',
      content: trimmedBlock.replace(/^>\s?/gm, '').trim(),
      raw: block,
      position: { start, end }
    };
  }
  
  // Check for lists
  if (trimmedBlock.match(/^[-*+]\s/) || trimmedBlock.match(/^\d+\.\s/)) {
    return {
      type: 'list',
      content: trimmedBlock,
      raw: block,
      position: { start, end }
    };
  }
  
  // Check for tables
  if (trimmedBlock.includes('|') && trimmedBlock.includes('---')) {
    return {
      type: 'table',
      content: trimmedBlock,
      raw: block,
      position: { start, end }
    };
  }
  
  // Check for horizontal rules
  if (trimmedBlock.match(/^([-*_]){3,}$/)) {
    return {
      type: 'horizontal_rule',
      content: '',
      raw: block,
      position: { start, end }
    };
  }
  
  // Default to paragraph
  return {
    type: 'paragraph',
    content: trimmedBlock,
    raw: block,
    position: { start, end }
  };
}

/**
 * Builds a hierarchy of nodes based on heading levels
 * @param nodes Flat array of nodes
 * @returns Hierarchical array of nodes with parent-child relationships
 */
function buildHierarchy(nodes: MarkdownNode[]): MarkdownNode[] {
  const rootNodes: MarkdownNode[] = [];
  const headingStack: MarkdownNode[] = [];
  
  for (const node of nodes) {
    // Handle headings specially for hierarchy building
    if (node.type === 'heading') {
      // Pop headings from stack that are same or lower level than current
      while (
        headingStack.length > 0 && 
        headingStack[headingStack.length - 1].type === 'heading' &&
        (headingStack[headingStack.length - 1].level || 0) >= (node.level || 0)
      ) {
        headingStack.pop();
      }
      
      // If stack empty, this is a root node
      if (headingStack.length === 0) {
        rootNodes.push(node);
      } else {
        // Otherwise, add as child to parent
        const parent = headingStack[headingStack.length - 1];
        if (!parent.children) parent.children = [];
        parent.children.push(node);
        node.parent = parent;
      }
      
      // Push current heading to stack
      headingStack.push(node);
    } else {
      // For non-headings, add as child to current heading or as root
      if (headingStack.length === 0) {
        rootNodes.push(node);
      } else {
        const parent = headingStack[headingStack.length - 1];
        if (!parent.children) parent.children = [];
        parent.children.push(node);
        node.parent = parent;
      }
    }
  }
  
  return rootNodes;
}

/**
 * Extracts the heading path (breadcrumb) for a node
 * @param node The node to get heading path for
 * @returns Array of heading texts forming the path
 */
export function getHeadingPath(node: MarkdownNode): string[] {
  const path: string[] = [];
  let current: MarkdownNode | undefined = node;
  
  // Traverse up the parent chain to build path
  while (current) {
    if (current.type === 'heading') {
      path.unshift(current.content);
    }
    current = current.parent;
  }
  
  return path;
}

/**
 * Converts a Markdown node hierarchy back to plain text
 * @param nodes Array of nodes to convert
 * @returns Plain text representation
 */
export function nodesToText(nodes: MarkdownNode[]): string {
  let result = '';
  
  for (const node of nodes) {
    // Add content based on node type
    if (node.type === 'heading') {
      result += node.content;
    } else {
      result += node.content;
    }
    
    result += '\n\n';
    
    // Process children if present
    if (node.children && node.children.length > 0) {
      result += nodesToText(node.children);
    }
  }
  
  return result.trim();
}

/**
 * Extracts plain text from a Markdown node structure with context preservation
 * @param nodes Markdown nodes to process
 * @param options Options for text extraction
 * @returns Plain text with preserved context
 */
export function extractTextWithContext(
  nodes: MarkdownNode[],
  options: {
    includeHeadings?: boolean;
    preserveListMarkers?: boolean;
    preserveLineBreaks?: boolean;
  } = {}
): string {
  const {
    includeHeadings = true,
    preserveListMarkers = false,
    preserveLineBreaks = true
  } = options;
  
  let result = '';
  
  // Process nodes in a flattened way to preserve document flow
  const flattenedNodes = flattenNodes(nodes);
  
  let currentHeadingPath: string[] = [];
  
  for (const node of flattenedNodes) {
    // Handle headings specially
    if (node.type === 'heading') {
      currentHeadingPath = getHeadingPath(node);
      
      if (includeHeadings) {
        result += `${node.content}\n`;
        if (preserveLineBreaks) result += '\n';
      }
    } else {
      // For content under headings, optionally prefix with the heading path
      let nodeText = '';
      
      // Process different node types
      switch (node.type) {
        case 'list':
          if (preserveListMarkers) {
            nodeText = node.content;
          } else {
            // Remove list markers but preserve items
            nodeText = node.content
              .replace(/^[-*+]\s+/gm, '')
              .replace(/^\d+\.\s+/gm, '');
          }
          break;
          
        case 'codeblock':
          // Skip code blocks or include with context
          nodeText = `${node.content}`;
          break;
          
        default:
          nodeText = node.content;
      }
      
      if (nodeText.trim()) {
        result += `${nodeText}\n`;
        if (preserveLineBreaks) result += '\n';
      }
    }
  }
  
  return result.trim();
}

/**
 * Flattens a node hierarchy into a single array in document order
 * @param nodes Root nodes to flatten
 * @returns Flattened array of nodes
 */
function flattenNodes(nodes: MarkdownNode[]): MarkdownNode[] {
  const result: MarkdownNode[] = [];
  
  function traverse(nodeList: MarkdownNode[]) {
    for (const node of nodeList) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  
  traverse(nodes);
  return result;
}