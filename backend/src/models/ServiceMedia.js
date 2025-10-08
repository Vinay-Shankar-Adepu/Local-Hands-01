import mongoose from 'mongoose';

const serviceMediaSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['customer','provider'], required: true },
  kind: { type: String, enum: ['before','after','other'], default: 'other' },
  url: { type: String, required: true },
  caption: { type: String, maxlength: 300 }
},{ timestamps: true });

serviceMediaSchema.index({ serviceId: 1, createdAt: 1 });

const ServiceMedia = mongoose.model('ServiceMedia', serviceMediaSchema);
export default ServiceMedia;
