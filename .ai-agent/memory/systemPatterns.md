# systemPatterns.md

## Module Responsibilities

- **config.ts**: Manage configuration and environment validation
- **db/chroma-client.ts**: ChromaDB client instantiation and persistence
- **db/collections.ts**: Collection creation, upsert, and query
- **embedding/openai.ts**: OpenAI embedding logic
- **markdown/loader.ts**: Markdown file discovery and loading
- **markdown/parser.ts**: Markdown-to-text conversion and chunking
- **search/query.ts**: Similarity and filtered search
- **index.ts**: Orchestrate the entire workflow

## System Architecture (Mermaid Diagram)

```mermaid
flowchart TD
    subgraph CLI Execution
        A[Start: index.ts]
    end
    subgraph Config & Initialization
        B[config.ts<br>Load env/config]
        C[chroma-client.ts<br>ChromaDB init]
        D[collections.ts<br>Get collection]
    end
    subgraph Data Processing
        E[loader.ts<br>Markdown load]
        F[parser.ts<br>Text extract/chunk]
        G[openai.ts<br>Vectorize]
        H[collections.ts<br>Upsert]
    end
    subgraph Search
        I[query.ts<br>Similarity search]
        J[CLI Output]
    end

    A --> B --> C --> D
    D --> E --> F --> G --> H
    H --> I --> J
