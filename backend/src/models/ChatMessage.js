import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, maxlength: 2000 },
  // simple attachments; could later expand to separate collection for large files
  attachments: [{ type: String }],
  sentAt: { type: Date, default: Date.now }
},{ timestamps: true });

chatMessageSchema.index({ serviceId: 1, sentAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
