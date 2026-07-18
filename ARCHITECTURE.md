# Architecture & Design Decisions

## Project Structure
The project is organized as a monorepo containing two distinct parts:
- `backend/`: Node.js, Express, TypeScript, and MongoDB (via Mongoose).
- `frontend/`: React 18, TypeScript, Vite, and Tailwind CSS.

This structure allows for easy local development while maintaining a clear separation of concerns between the client and server.

## Database Design
We use MongoDB, a NoSQL database, which is well-suited for document-heavy applications. The schema consists of:
- **User**: Stores email and securely hashed passwords (using `bcryptjs`).
- **Document**: Stores metadata (filename, size, mimetype), the owner's ID, and the `extractedText`. Note: For this assessment, storing text directly in the Document model simplifies retrieval. In a production environment with massive documents, an object storage service (like AWS S3) combined with a Vector Database (like Pinecone) would be more appropriate.
- **Conversation**: Stores the history of questions and AI-generated answers, linked to both the User and the Document.

## Authentication Approach
The application uses JWT (JSON Web Tokens) for stateless authentication. 
1. Upon successful login or registration, the backend issues a signed JWT.
2. The frontend stores this token (e.g., in localStorage) and includes it in the `Authorization: Bearer <token>` header of subsequent API requests.
3. An `authMiddleware` on the backend verifies the token and attaches the authenticated user to the request object.

## AI Integration
The `@google/genai` SDK is used to interact with the Gemini API (specifically `gemini-2.5-flash`). 
Instead of a complex RAG (Retrieval-Augmented Generation) pipeline, the application extracts text from uploaded PDFs (using `pdf-parse`) or TXT/MD files and passes the entire text as context within the LLM prompt. This provides highly accurate answers for small-to-medium documents without the overhead of maintaining a Vector Database.

## Future Improvements & Scalability
If the application needs to scale:
1. **Vector Database & RAG**: Implement chunking and embeddings (e.g., using `text-embedding-004`) to store document chunks in a Vector DB. This avoids context window limits and reduces token costs for large documents.
2. **Cloud Storage**: Move file storage to AWS S3 or Google Cloud Storage instead of keeping it in memory or MongoDB.
3. **Queue System**: Process large PDF text extractions asynchronously using a message queue (like RabbitMQ or Redis/Bull) to avoid blocking the main Node.js event loop.
4. **Caching**: Use Redis to cache frequent dashboard metrics or repeated exact questions.
