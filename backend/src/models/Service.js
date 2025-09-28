import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g. "ride", "cleaning"
    price: { type: Number, required: true },
    duration: { type: String }, // "30 min"
    rating: { type: Number, default: 0 },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
