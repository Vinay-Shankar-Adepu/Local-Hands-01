import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.pre('validate', function(next){
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }
  next();
});

// Removed redundant manual slug index (unique on field already creates index)

const Category = mongoose.model('Category', categorySchema);
export default Category;