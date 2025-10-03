import { Router } from 'express';
import Category from '../models/Category.js';
import ServiceTemplate from '../models/ServiceTemplate.js';

const router = Router();

router.get('/', async (_req,res)=>{
  try {
    const categories = await Category.find({ active: true }).sort('name');
    const templates = await ServiceTemplate.find({ active: true }).populate('category','name');
    const grouped = categories.map(c => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      services: templates.filter(t => t.category && t.category._id.toString() === c._id.toString()).map(t => ({ _id: t._id, name: t.name, defaultPrice: t.defaultPrice }))
    }));
    res.json({ catalog: grouped });
  } catch(e){ res.status(500).json({ message: e.message }); }
});

export default router;
