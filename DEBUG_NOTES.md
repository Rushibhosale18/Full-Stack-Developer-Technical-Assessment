# Debug Notes

During the development of the AI-Powered Knowledge Base Assistant, the following issues were encountered and resolved:

### 1. `multer` File Upload Parsing
**Problem:** The `pdf-parse` library was throwing an error when attempting to extract text from an uploaded PDF.
**Root Cause:** `multer` was initially configured with `dest: 'uploads/'`, which writes files to disk. `pdf-parse` expects a data buffer, not a file path string or stream, which was causing it to fail.
**Investigation:** I logged the `req.file` object and noticed that the `buffer` property was undefined, while the `path` property was populated.
**Solution:** I changed the `multer` configuration to use `multer.memoryStorage()`. This stores the uploaded file entirely in memory (RAM) and exposes the `buffer` property on `req.file`, which `pdf-parse` successfully parses.

### 2. Gemini API Context Length Error
**Problem:** When asking a question about a very large PDF, the Gemini API returned a 400 Bad Request error.
**Root Cause:** The extracted text from the large PDF exceeded the token limit of the model being used in the prompt.
**Investigation:** I caught the API error and logged the response. The error message indicated that the maximum context length was exceeded.
**Solution:** For the scope of this assessment, I added an error handler to catch AI API failures and gracefully return a `502 Bad Gateway` to the frontend with the message "Error communicating with AI service". *Note: In a real-world scenario, this would be solved by chunking the document and implementing a Vector DB (RAG).*

### 3. React Router and Protected Routes
**Problem:** A user who is not logged in could navigate directly to the `/dashboard` URL and see a blank page before being redirected, or they could trigger unauthenticated API calls.
**Root Cause:** The routing setup lacked a robust higher-order component to verify authentication state before rendering the component tree.
**Investigation:** I checked the React Context state on initial load and saw that `user` was `null` initially while `localStorage` had a token.
**Solution:** I implemented a `ProtectedRoute` wrapper component that checks for the presence of the authentication token and redirect the user to the `/login` page if it is missing, preventing any flash of unauthenticated content.
