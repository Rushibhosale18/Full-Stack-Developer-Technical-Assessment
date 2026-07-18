# AI Usage Documentation

### AI Tools Used
- Google Gemini 3.1 Pro (via Antigravity Agent)

### How AI was used
- The AI was used to brainstorm the architecture and determine the fastest way to implement the requirements within the constraints of a technical assessment.
- The AI acted as a pair-programmer, generating boilerplate code for the Express server, Mongoose models, and React UI components.

### Example Prompts
- "Create an Express router for handling file uploads using multer and extracting text from PDFs using pdf-parse."
- "Generate a responsive React dashboard layout using Tailwind CSS with a sidebar and main content area."

### What code was AI-generated
- The majority of the boilerplate code (e.g., Express setup, Mongoose models, basic React component structures) was AI-generated.
- The Tailwind CSS utility classes for styling were largely AI-generated.

### What was modified manually
- The AI's initial suggestions for file uploading included saving files to disk. This was modified to use `multer.memoryStorage()` to simplify deployment and cleanup.
- The integration between the frontend API calls and the backend endpoints was manually adjusted to ensure proper error handling and state updates in React.

### Incorrect Suggestions & Verification
- **Incorrect Suggestion:** The AI initially suggested using `react-router-dom` v5 syntax (e.g., `<Switch>`).
- **Correction:** I modified the code to use the modern `react-router-dom` v6 syntax (e.g., `<Routes>` and `useNavigate`).
- **Verification:** All generated code was reviewed line-by-line and tested locally using `npm run dev` for both frontend and backend to ensure functionality and correctness.
