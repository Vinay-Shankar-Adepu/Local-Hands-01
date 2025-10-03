import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ServiceTemplate from '../models/ServiceTemplate.js';
import Service from '../models/Service.js';

dotenv.config();

// Allow override via env var RANDOM_PROVIDER_COUNT, fallback to 15
const PROVIDER_COUNT = Number(process.env.RANDOM_PROVIDER_COUNT || 15);

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pickN(array,n){
  const shuffled=[...array].sort(()=>Math.random()-0.5);
  return shuffled.slice(0,Math.min(n,shuffled.length));
}

async function run(){
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');

    const templates = await ServiceTemplate.find({ active: true }).populate('category','name');
    if(templates.length === 0){
      console.log('No templates found. Run bootstrap or seedCatalog first.');
      process.exit(0);
    }

    const existingProviders = await User.countDocuments({ role: 'provider' });
    console.log('Existing providers:', existingProviders);

    for(let i=0;i<PROVIDER_COUNT;i++){
      const name = `Seed Provider ${existingProviders + i + 1}`;
      const email = `seed_provider_${Date.now()}_${i}@test.com`;
      const password = await bcrypt.hash('Provider123!',10);
      const rating = (Math.random()*2 + 3).toFixed(1); // between 3.0 and 5.0 approx
      const ratingCount = randInt(5,120);
      const user = await User.create({ name, email, password, role: 'provider', verified: true, rating: Number(rating), ratingCount });

      // assign 2-4 random templates
      const chosen = pickN(templates, randInt(2,4));
      for(const tpl of chosen){
        try {
          await Service.create({
            name: tpl.name,
            category: tpl.category?.name || 'General',
            price: tpl.defaultPrice,
            provider: user._id,
            template: tpl._id,
            lockedPrice: true
          });
        } catch(e){
          if(!/duplicate key/i.test(e.message)) console.error('Service create error', e.message);
        }
      }
      console.log('Created provider', name, 'with', chosen.length, 'services and rating', rating);
    }

    console.log('Random providers seed complete');
    process.exit(0);
  } catch(e){
    console.error(e);
    process.exit(1);
  }
}

run();
