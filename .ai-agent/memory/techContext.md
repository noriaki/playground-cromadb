# techContext.md

## Environment Setup

### 1. Project Initialization

```bash
# Navigate to the project root directory
cd /home/noriaki/workspace/ai-programming/playground-cromadb

# Initialize TypeScript project
pnpm init
pnpm add -D typescript ts-node @types/node
pnpm exec tsc --init
```

### 2. Install Required Packages

```bash
# Install ChromaDB, OpenAI client, and other utilities
pnpm add chromadb openai dotenv markdown-it glob
pnpm add -D @types/markdown-it @types/glob
```

### 3. Environment Variables Setup

Create a `.env` file in the project root with the following content:

```
OPENAI_API_KEY=your_openai_api_key
```

## Directory Structure

Use the following directory structure for the project:

```
/playground-cromadb
  ├── .env                      # Environment variables
  ├── package.json              # npm package configuration
  ├── tsconfig.json             # TypeScript configuration
  ├── src/
  │   ├── index.ts              # Entry point
  │   ├── config.ts             # Configuration management
  │   ├── db/
  │   │   ├── chroma-client.ts  # ChromaDB client
  │   │   └── collections.ts    # Collection management
  │   ├── embedding/
  │   │   └── openai.ts         # OpenAI Embedding management
  │   ├── markdown/
  │   │   ├── loader.ts         # Markdown file loader
  │   │   └── parser.ts         # Markdown parser
  │   └── search/
  │       └── query.ts          # Search logic
  ├── data/
  │   └── markdown/             # Sample Markdown files storage
  └── dist/                     # Compiled JavaScript files
