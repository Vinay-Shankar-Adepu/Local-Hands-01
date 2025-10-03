import Category from '../models/Category.js';
import ServiceTemplate from '../models/ServiceTemplate.js';

// Default categories & template seeds (can be extended)
// Updated with emoji-prefixed display names per user request
const DEFAULT_CATEGORIES = [
  '🏠 Home Services',
  '💇 Personal Services',
  '🚗 Automotive Services',
  '💻 Technology & Appliances',
  '🎉 Events & Catering'
];

// Minimal representative templates (one or more per category)
const DEFAULT_TEMPLATES = {
  '🏠 Home Services': [
    { name: 'House Cleaning', defaultPrice: 80 },
    { name: 'Plumbing', defaultPrice: 120 },
    { name: 'Electrical', defaultPrice: 110 },
    { name: 'Carpentry', defaultPrice: 130 },
    { name: 'Painting', defaultPrice: 150 }
  ],
  '💇 Personal Services': [
    { name: 'Salon', defaultPrice: 100 },
    { name: 'Spa', defaultPrice: 180 }
  ],
  '🚗 Automotive Services': [
    { name: 'Vehicle Towing', defaultPrice: 200 },
    { name: 'Car Repair', defaultPrice: 250 },
    { name: 'Bike Repair', defaultPrice: 120 }
  ],
  '💻 Technology & Appliances': [
    { name: 'Mobile Repair', defaultPrice: 90 },
    { name: 'Laptop/Desktop Repair', defaultPrice: 140 },
    { name: 'AC Repair & Installation', defaultPrice: 300 },
    { name: 'Refrigerator/Washing Machine Repair', defaultPrice: 220 },
    { name: 'CCTV Installation', defaultPrice: 260 },
    { name: 'Smart Home Setup', defaultPrice: 180 }
  ],
  '🎉 Events & Catering': [
    { name: 'Photography', defaultPrice: 250 },
    { name: 'Catering', defaultPrice: 400 },
    { name: 'Music', defaultPrice: 300 },
    { name: 'Home Decoration', defaultPrice: 350 }
  ]
};

// Helper to slugify (strip emojis & symbols) similar to earlier logic
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

export async function ensureCatalog() {
  try {
    // Only run if at least one default category missing OR explicitly requested
    const existing = await Category.find({ name: { $in: DEFAULT_CATEGORIES } }).lean();
    if (existing.length === DEFAULT_CATEGORIES.length) {
      // Quick integrity check: ensure at least one template exists; if yes, skip
      const templateCount = await ServiceTemplate.countDocuments();
      if (templateCount > 0) return; // already seeded
    }

    const nameToId = {};
    for (const name of DEFAULT_CATEGORIES) {
      const slug = toSlug(name);
      // Try find by exact name first, else by slug (legacy non-emoji name support)
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = await Category.findOne({ slug });
        if (cat && cat.name !== name) {
          cat.name = name; // upgrade to emoji version
          await cat.save();
          console.log('🔁 Upgraded category name to include emoji:', name);
        }
      }
      if (!cat) {
        cat = await Category.create({ name, slug, active: true });
        console.log('📦 Created category', name);
      }
      nameToId[name] = cat._id;
    }

    for (const [catName, templates] of Object.entries(DEFAULT_TEMPLATES)) {
      const catId = nameToId[catName];
      for (const t of templates) {
        const exists = await ServiceTemplate.findOne({ name: t.name, category: catId });
        if (!exists) {
          await ServiceTemplate.create({ ...t, category: catId, active: true });
          console.log('🛠️  Created template', t.name);
        }
      }
    }
    console.log('✅ Catalog bootstrap complete');
  } catch (e) {
    console.error('Catalog bootstrap error:', e.message);
  }
}

export { DEFAULT_CATEGORIES, DEFAULT_TEMPLATES };