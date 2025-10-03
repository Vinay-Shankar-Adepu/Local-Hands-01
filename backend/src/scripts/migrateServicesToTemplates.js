import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Service from '../models/Service.js';
import ServiceTemplate from '../models/ServiceTemplate.js';
import Category from '../models/Category.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');
    const templates = await ServiceTemplate.find({}).populate('category','name');
    const templateMap = new Map(); // key: name|category -> template
    for (const t of templates) templateMap.set(`${t.name}|${t.category?.name}`, t);

    const services = await Service.find({ template: { $exists: false } });
    let migrated = 0;
    for (const s of services) {
      const key = `${s.name}|${s.category}`;
      const tpl = templateMap.get(key);
      if (tpl) {
        s.template = tpl._id;
        s.lockedPrice = true;
        s.price = tpl.defaultPrice; // normalize
        await s.save();
        migrated++;
      }
    }
    console.log(`Migration complete. Migrated ${migrated} legacy services.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();