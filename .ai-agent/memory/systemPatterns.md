# systemPatterns.md

## Module Responsibilities

- **config.ts**: Manage configuration and environment validation
- **db/chroma-client.ts**: ChromaDB client instantiation and HTTP connection to Docker container
- **db/collections.ts**: Collection creation, upsert, and query
- **embedding/openai.ts**: OpenAI embedding logic
- **markdown/loader.ts**: Markdown file discovery and loading
- **markdown/parser.ts**: Markdown-to-text conversion and chunking
- **search/query.ts**: Similarity and filtered search
- **index.ts**: Orchestrate the entire workflow
- **docker-compose.yml**: ChromaDB server containerization and persistence configuration

## System Architecture (Mermaid Diagram)

```mermaid
flowchart TD
    subgraph CLI Execution
        A[Start: index.ts]
    end
    subgraph Docker Container
        DC[ChromaDB Server]
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
    subgraph External Services
        OAI[OpenAI API]
    end

    A --> B --> C
    C <--> DC
    C --> D
    D --> E --> F --> G --> H
    G <--> OAI
    H --> I --> J
