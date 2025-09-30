import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const update = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (address !== undefined) update.address = address; // customer only concept, but we won't restrict here yet
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-password");
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({ user });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const getCustomerPublic = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("name phone address rating ratingCount");
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({ user });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
