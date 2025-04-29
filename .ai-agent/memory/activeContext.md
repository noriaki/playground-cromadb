# activeContext.md

## Implementation Flow

1. Load configuration and environment variables  
   - Read `OPENAI_API_KEY` from `.env`
2. Ensure ChromaDB persistence directory exists
3. Initialize ChromaDB client and check health
4. Get or create the collection
5. Load, parse, and chunk Markdown files
6. Vectorize text using OpenAI and upsert into ChromaDB
7. Perform similarity search via CLI and display results

## Execution Method

Run the project with the following commands:

```bash
# Compile TypeScript
pnpm exec tsc

# Run the application
node dist/index.js
```

When you run the application, it will:
1. Create a persistent ChromaDB database in the `chroma_db` directory
2. Process and embed markdown files 
3. Store the results for future use
4. Subsequent runs will update the existing database rather than starting from scratch

## MCP Server Integration

- Use MCP server tools for basic GitHub Flow operations (branching, commit, PR creation).
- Manual review and merge unless otherwise instructed.
