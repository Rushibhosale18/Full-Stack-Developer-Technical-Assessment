# AI-Powered Knowledge Base Assistant

This is a Full Stack application that allows users to upload documents (PDF, TXT, MD) and ask AI-powered questions about their contents using the Gemini API.

## Features
- **User Authentication**: Secure registration and login using JWT and bcrypt.
- **Document Management**: Upload PDF, TXT, and Markdown files. Documents are parsed and text is extracted for AI context.
- **AI Question Answering**: Ask questions about your uploaded documents, powered by Google's Gemini LLM.
- **Chat History**: Keep track of previous questions and answers.
- **Dashboard**: View metrics like total documents, total questions asked, and recent uploads.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6.
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Multer, pdf-parse.
- **AI Provider**: Google Gemini (@google/genai).

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas URL)
- Google Gemini API Key

### Installation

1. **Clone the repository** (or extract the zip file):
   bash
   git clone <repository_url>
   cd ai-knowledge-base
   

2. **Backend Setup**:
   bash
   cd backend
   npm install
   
   Create a .env file in the backend directory with the following contents:
   env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ai-knowledge-base
   GEMINI_API_KEY=Not Provided the secreate Key because of the security reasons
   Start the backend server:
   bash
   npm run dev
   

3. **Frontend Setup**:
   Open a new terminal window:
   bash
   cd frontend
   npm install
   
   Create a .env file in the frontend directory:
   env
   VITE_API_URL=https://full-stack-developer-technical-asse.vercel.app/
   
   Start the frontend dev server:
   bash
   npm run dev
   

## Design Decisions
- **Text Extraction**: Text is extracted from documents at the time of upload using pdf-parse. This simplifies the architecture by avoiding a background worker, but keeps the upload request synchronous.
- **AI Context**: Extracted text is passed directly in the prompt context to Gemini. This is extremely effective for most documents, although very large documents might hit token limits.
- **File Storage**: Uploads use multer.memoryStorage(), so files are not saved to disk permanently. The text is extracted in memory and saved to MongoDB. This makes deployment easier (no persistent file storage volume needed).

## Future Improvements
- **Vector Database (RAG)**: For massive documents, implement document chunking and store embeddings in a vector database like Pinecone or ChromaDB.
- **Cloud Storage**: Store original files in AWS S3 so users can download them later.
- **Pagination**: Add pagination to the chat history and documents list.
