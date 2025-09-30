import { Router } from "express";
import Service from "../models/Service.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// List services (basic filters: category, provider)
router.get("/", async (req, res) => {
  try {
    const { category, provider } = req.query;
    const q = {};
    if (category) q.category = category;
    if (provider) q.provider = provider;
    const services = await Service.find(q).limit(100).sort("name");
    // debug: count services
    // console.log("Services fetched:", services.length);
    res.json({ services });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// List only current provider's services
router.get("/mine", requireAuth, requireRole("provider"), async (req, res) => {
  try {
    const services = await Service.find({ provider: req.userId }).sort("name");
    res.json({ services });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create service (provider only)
router.post("/", requireAuth, requireRole("provider"), async (req, res) => {
  try {
    const { name, category, price, duration } = req.body;
    if (!name || !category || price == null) {
      return res.status(400).json({ message: "name, category, price required" });
    }
    const service = await Service.create({ name, category, price, duration, provider: req.userId });
    res.status(201).json({ service });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Update service (owner provider)
router.patch("/:id", requireAuth, requireRole("provider"), async (req, res) => {
  try {
    const { id } = req.params;
    const update = (({ name, category, price, duration }) => ({ name, category, price, duration }))(req.body);
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
    const service = await Service.findOneAndUpdate({ _id: id, provider: req.userId }, update, { new: true });
    if (!service) return res.status(404).json({ message: "Not found" });
    res.json({ service });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Delete service (owner provider)
router.delete("/:id", requireAuth, requireRole("provider"), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findOneAndDelete({ _id: id, provider: req.userId });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
