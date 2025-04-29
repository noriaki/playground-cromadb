# productContext.md

## Extension Ideas

1. **Web UI**: Provide search functionality through a simple web UI
2. **Metrics**: Implement mechanisms to evaluate search quality and performance
3. **Embedding Model Comparison**: Compare performance with other embedding models
4. **Multimodal Support**: Extend to support images and other data types
5. **Data Sync**: Add functionality to sync with remote data sources

## Troubleshooting

1. **OPENAI_API_KEY not set error**: Verify that the API key is correctly set in the `.env` file.
2. **ChromaDB client connection error**: Check for version compatibility with ChromaDB.
3. **Memory errors**: Adjust chunk sizes or switch to streaming processing when handling large amounts of data.
4. **Database permission errors**: Ensure the application has write permissions to the persistence directory.
5. **Database corruption**: If experiencing issues with the database, delete the `chroma_db` directory to start fresh, but note that this will remove all indexed data.
