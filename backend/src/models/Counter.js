import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  key: { type: String, unique: true }, // e.g., "booking"
  seq: { type: Number, default: 1000 }
});

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;
