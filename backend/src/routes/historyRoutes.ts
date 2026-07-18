import express, { Response } from 'express';
import Conversation from '../models/Conversation';
import { protect, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.query;
    
    const query: any = { userId: req.user._id };
    if (documentId) {
      query.documentId = documentId;
    }

    const history = await Conversation.find(query)
      .populate('documentId', 'filename')
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
