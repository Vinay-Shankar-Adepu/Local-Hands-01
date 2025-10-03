import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // textual category name snapshot
    price: { type: Number, required: true },
    duration: { type: String },
    rating: { type: Number, default: 0 },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceTemplate' }, // origin template
    lockedPrice: { type: Boolean, default: true } // if true providers cannot change price
  },
  { timestamps: true }
);

serviceSchema.index({ provider: 1, template: 1 }, { unique: true, sparse: true });

const Service = mongoose.model("Service", serviceSchema);
export default Service;
