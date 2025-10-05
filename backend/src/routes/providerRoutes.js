import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import ServiceTemplate from "../models/ServiceTemplate.js";
import Service from "../models/Service.js";
import Category from "../models/Category.js";
import {
  nearbyProviders,
  setAvailability,
  updateLocation,
  submitOnboarding
} from "../controllers/providerController.js";

const router = Router();

// public: discover providers near a point
router.get("/nearby", nearbyProviders);

// public provider profile with recent reviews
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('name rating ratingCount role completedJobs');
    if (!user || user.role !== 'provider') return res.status(404).json({ message: 'Provider not found' });
    const completedJobs = await Booking.countDocuments({ provider: id, status: 'completed' });
    const recentReviews = await Review.find({ provider: id, direction: 'customer_to_provider', isPublic: true })
      .sort('-createdAt')
      .limit(10)
      .select('rating comment optionalMessage workImages createdAt direction customer provider');
    // Provider services (only active templates)
    const servicesRaw = await Service.find({ provider: id }).populate('template','active');
    const services = servicesRaw.filter(s=> !s.template || s.template.active !== false)
      .map(s=> ({ _id: s._id, name: s.name, price: s.price, category: s.category }));
    res.json({ provider: user, stats: { completedJobs }, reviews: recentReviews, services });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Provider selects services from templates
router.post('/select-services', requireAuth, requireRole('provider'), async (req,res) => {
  try {
    const { templateIds = [] } = req.body;
    if(!Array.isArray(templateIds) || templateIds.length === 0) return res.status(400).json({ message: 'templateIds required' });
    const tpls = await ServiceTemplate.find({ _id: { $in: templateIds }, active: true }).populate('category','name');
    const created = [];
    for (const tpl of tpls) {
      // ensure unique per provider per template
      const existing = await Service.findOne({ provider: req.userId, template: tpl._id });
      if (existing) { created.push(existing); continue; }
      created.push(await Service.create({
        name: tpl.name,
        category: tpl.category?.name || 'General',
        price: tpl.defaultPrice,
        provider: req.userId,
        template: tpl._id,
        lockedPrice: true
      }));
    }
    res.status(201).json({ services: created });
  } catch(e){ res.status(500).json({ message: e.message }); }
});

// provider secured routes
router.patch("/availability", requireAuth, requireRole("provider"), setAvailability);
router.patch('/go-live', requireAuth, requireRole('provider'), (req,res)=>{ req.body.isAvailable = true; return setAvailability(req,res); });
router.patch('/go-offline', requireAuth, requireRole('provider'), (req,res)=>{ req.body.isAvailable = false; return setAvailability(req,res); });
router.patch("/location", requireAuth, requireRole("provider"), updateLocation);
router.post("/onboarding", requireAuth, requireRole("provider"), submitOnboarding);

export default router;
