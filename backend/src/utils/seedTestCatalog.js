import Category from '../models/Category.js';
import ServiceTemplate from '../models/ServiceTemplate.js';

let seeded = false;
export async function seedTestCatalog(){
  if(seeded) return; // idempotent
  try {
    const existing = await ServiceTemplate.findOne();
    if(existing){ seeded = true; return; }
    const cat = await Category.create({ name: '📱 Technology & Appliances', slug: 'technology-appliances', active: true });
    await ServiceTemplate.create({ name: 'Mobile Repair', category: cat._id, defaultPrice: 90, active: true });
    seeded = true;
  } catch(e){
    // swallow errors in test to avoid noise
  }
}
