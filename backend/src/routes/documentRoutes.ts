import express, { Response } from 'express';
import multer from 'multer';
const pdfParse = require('pdf-parse-new');
import Document from '../models/Document';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', protect, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    let extractedText = '';

    if (mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (mimetype === 'text/plain' || mimetype === 'text/markdown' || originalname.endsWith('.md')) {
      extractedText = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Please upload PDF, TXT, or MD.' });
    }

    const document = await Document.create({
      filename: originalname,
      originalName: originalname,
      mimeType: mimetype,
      size,
      extractedText,
      ownerId: req.user._id,
    });

    res.status(201).json({
      _id: document._id,
      filename: document.filename,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      createdAt: document.createdAt,
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const documents = await Document.find({ ownerId: req.user._id }).select('-extractedText');
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    await document.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
