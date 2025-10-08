import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import ChatMessage from '../models/ChatMessage.js';
import ServiceMedia from '../models/ServiceMedia.js';

const router = Router();

// GET /api/service-aggregate/:serviceId  -> unified view of a service instance
router.get('/:serviceId', requireAuth, async (req,res)=>{
  try {
    const { serviceId } = req.params;
    const booking = await Booking.findOne({ serviceId });
    if(!booking) return res.status(404).json({ message: 'Service not found' });
    // Authorization: must be provider or customer of booking or admin
    if(req.userRole !== 'admin' && booking.customer.toString() !== req.userId && (!booking.provider || booking.provider.toString() !== req.userId)){
      return res.status(403).json({ message: 'Not authorized' });
    }
    const [reviews, chat, media] = await Promise.all([
      Review.find({ serviceId }).sort('-createdAt'),
      ChatMessage.find({ serviceId }).sort('sentAt').limit(500),
      ServiceMedia.find({ serviceId }).sort('createdAt')
    ]);
    res.json({ serviceId, booking, reviews, chat, media });
  } catch(e){ res.status(500).json({ message: e.message }); }
});

export default router;