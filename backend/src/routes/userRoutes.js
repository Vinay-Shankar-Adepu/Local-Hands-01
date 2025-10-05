import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { updateProfile, getProfile, getCustomerPublic } from "../controllers/userController.js";
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const router = Router();

router.get("/me", requireAuth, getProfile);
router.patch("/me", requireAuth, updateProfile);
router.get("/customer/:id", requireAuth, getCustomerPublic); // provider can view customer details

// Public history preview for trust decisions (limited, safe fields)
router.get('/public-history/:id', requireAuth, async (req,res)=>{
	try {
		const { id } = req.params;
		const user = await User.findById(id).select('name role rating ratingCount');
		if(!user) return res.status(404).json({ message: 'Not found' });
		const completed = await Booking.countDocuments({ $or:[ { customer: id }, { provider: id } ], status: 'completed' });
		const reviews = await Review.find({ $or:[ { customer: id }, { provider: id } ] })
			.sort('-createdAt')
			.limit(5)
			.select('direction rating comment createdAt provider customer');
		res.json({ user, stats: { completed }, reviews });
	} catch(e){ res.status(500).json({ message: e.message }); }
});

export default router;
