import mongoose from 'mongoose';

const serviceTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  defaultPrice: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

serviceTemplateSchema.index({ name: 1, category: 1 }, { unique: true });

const ServiceTemplate = mongoose.model('ServiceTemplate', serviceTemplateSchema);
export default ServiceTemplate;