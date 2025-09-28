import Counter from "../models/Counter.js";

// Generates sequential IDs like O1001, O1002...
export async function nextBookingId() {
  const doc = await Counter.findOneAndUpdate(
    { key: "booking" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `O${doc.seq}`;
}
