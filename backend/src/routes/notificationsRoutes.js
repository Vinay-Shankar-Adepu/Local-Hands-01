import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';

const router = Router();

// List notifications (optional unreadOnly param)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const filter = { user: req.userId };
    if (unreadOnly === 'true') filter.read = false;
    const list = await Notification.find(filter).sort('-createdAt').limit(50);
    res.json({ notifications: list });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Mark single notification read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findOneAndUpdate({ _id: id, user: req.userId }, { read: true }, { new: true });
    if (!n) return res.status(404).json({ message: 'Not found' });
    res.json({ notification: n });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Mark all read
router.patch('/read-all', requireAuth, async (req, res) => {
  try { await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } }); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
