import { ChromaClient } from 'chromadb';

// Singleton instance of ChromaDB client
let client: ChromaClient | null = null;

/**
 * Get ChromaDB client instance
 * Instantiate in Ephemeral mode (in-memory)
 */
export function getChromaClient(): ChromaClient {
  if (!client) {
    client = new ChromaClient();
    console.log('ChromaDB client initialized (in-memory mode)');
  }
  return client;
}

/**
 * Check client health
 */
export async function checkClientHealth(): Promise<boolean> {
  try {
    const client = getChromaClient();
    const heartbeat = await client.heartbeat();
    console.log(`ChromaDB connection check: ${heartbeat}`);
    return true;
  } catch (error) {
    console.error('Failed to connect to ChromaDB client:', error);
    return false;
  }
}