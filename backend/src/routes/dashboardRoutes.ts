import express, { Response } from 'express';
import Document from '../models/Document';
import Conversation from '../models/Conversation';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const totalDocuments = await Document.countDocuments({ ownerId: req.user._id });
    const totalQuestions = await Conversation.countDocuments({ userId: req.user._id });
    const recentUploads = await Document.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('filename createdAt size');

    res.json({
      totalDocuments,
      totalQuestions,
      recentUploads,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
