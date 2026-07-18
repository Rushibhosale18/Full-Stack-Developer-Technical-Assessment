import express, { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import Document from '../models/Document';
import Conversation from '../models/Conversation';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock-key' });

router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ message: 'Document ID and question are required' });
    }

    const document = await Document.findOne({ _id: documentId, ownerId: req.user._id });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ message: 'Document has no extractable text' });
    }

    // Call Gemini API
    const prompt = `You are a helpful AI assistant. Answer the user's question based ONLY on the following document context. If the answer is not in the context, say "I cannot answer this based on the provided document."\n\nDocument Context:\n${document.extractedText}\n\nQuestion: ${question}\n\nAnswer:`;

    let answer = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      answer = response.text || 'No response generated.';
    } catch (apiError: any) {
      console.error('Gemini API Error:', apiError.message || apiError);
      console.log('Falling back to mock AI response due to API error.');
      answer = "This is a mock AI response. The provided API key was invalid or the AI service was unreachable, so I am responding with a simulated answer to demonstrate the functionality of the application!";
    }

    // Save the conversation
    const conversation = await Conversation.create({
      userId: req.user._id,
      documentId: document._id,
      question,
      answer,
    });

    res.json({
      _id: conversation._id,
      question: conversation.question,
      answer: conversation.answer,
      createdAt: conversation.createdAt,
    });
  } catch (error: any) {
    console.error('Error in /ask route:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
