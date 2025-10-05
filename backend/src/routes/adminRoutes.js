import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import Category from '../models/Category.js';
import ServiceTemplate from '../models/ServiceTemplate.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

// Categories CRUD
router.post('/categories', async (req,res)=>{ try { const { name } = req.body; if(!name) return res.status(400).json({message:'name required'}); const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); const cat = await Category.create({ name, slug }); res.status(201).json({ category: cat }); } catch(e){ res.status(500).json({ message: e.message }); }});
router.get('/categories', async (_req,res)=>{ try { const cats = await Category.find({ active: true }).sort('name'); res.json({ categories: cats }); } catch(e){ res.status(500).json({ message: e.message }); }});
router.patch('/categories/:id', async (req,res)=>{ try { const { id } = req.params; const { name, active } = req.body; const update = {}; if(name){ update.name = name; update.slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); } if(active!==undefined) update.active = active; const cat = await Category.findByIdAndUpdate(id, update, { new: true }); if(!cat) return res.status(404).json({ message: 'Not found' }); res.json({ category: cat }); } catch(e){ res.status(500).json({ message: e.message }); }});
router.delete('/categories/:id', async (req,res)=>{ try { const { id } = req.params; await Category.findByIdAndDelete(id); res.json({ success: true }); } catch(e){ res.status(500).json({ message: e.message }); }});

// Service Templates CRUD
router.post('/templates', async (req,res)=>{ try { const { name, category, defaultPrice=0 } = req.body; if(!name || !category) return res.status(400).json({message:'name & category required'}); const tpl = await ServiceTemplate.create({ name, category, defaultPrice }); res.status(201).json({ template: tpl }); } catch(e){ res.status(500).json({ message: e.message }); }});
router.get('/templates', async (req,res)=>{ try { const { category } = req.query; const q = { active: true }; if(category) q.category = category; const tpls = await ServiceTemplate.find(q).populate('category','name'); res.json({ templates: tpls }); } catch(e){ res.status(500).json({ message: e.message }); }});
// Update template with optional propagation to existing provider services
router.patch('/templates/:id', async (req,res)=>{ 
	try { 
		const { id } = req.params; 
		const { name, defaultPrice, active, propagate } = req.body; 
		const update = {}; 
		const nameChanged = !!name; 
		if(name) update.name = name; 
		if(defaultPrice!=null) update.defaultPrice = defaultPrice; 
		if(active!==undefined) update.active = active; 
		const tpl = await ServiceTemplate.findByIdAndUpdate(id, update, { new: true }); 
		if(!tpl) return res.status(404).json({ message: 'Not found' }); 
		// If name changed & propagate flag set, update all services referencing this template
		if (propagate && nameChanged) {
			const Service = (await import('../models/Service.js')).default;
			await Service.updateMany({ template: id }, { $set: { name: tpl.name } });
		}
		// If template deactivated, no immediate deletion, filtering handles invisibility.
		res.json({ template: tpl, propagated: !!(propagate && nameChanged) }); 
	} catch(e){ res.status(500).json({ message: e.message }); }
});
router.delete('/templates/:id', async (req,res)=>{ try { const { id } = req.params; await ServiceTemplate.findByIdAndDelete(id); res.json({ success: true }); } catch(e){ res.status(500).json({ message: e.message }); }});

export default router;
