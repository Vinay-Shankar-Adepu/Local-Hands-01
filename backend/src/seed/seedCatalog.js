import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import ServiceTemplate from '../models/ServiceTemplate.js';

dotenv.config();

// Updated emoji categories
const CATEGORIES = [
  { name: '🏠 Home Services' },
  { name: '💇 Personal Services' },
  { name: '🚗 Automotive Services' },
  { name: '💻 Technology & Appliances' },
  { name: '🎉 Events & Catering' }
];

// Map category name to template definitions
const TEMPLATE_DEFS = {
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

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const existing = await Category.find();
    const nameToId = {};
    for (const c of CATEGORIES) {
      let doc = existing.find(e => e.name === c.name);
      if (!doc) {
        doc = await Category.create(c);
        console.log('Created category', c.name);
      } else {
        console.log('Category exists', c.name);
      }
      nameToId[c.name] = doc._id;
    }

    for (const [catName, templates] of Object.entries(TEMPLATE_DEFS)) {
      const catId = nameToId[catName];
      for (const t of templates) {
        const exists = await ServiceTemplate.findOne({ name: t.name, category: catId });
        if (!exists) {
          await ServiceTemplate.create({ ...t, category: catId, active: true });
          console.log('Created template', t.name);
        } else {
          console.log('Template exists', t.name);
        }
      }
    }

    console.log('Catalog seed complete');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
