import User from "../models/User.js";

// Provider toggles availability
export const setAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { isAvailable: !!isAvailable },
      { new: true }
    ).select("-password");
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update provider live location (lng, lat)
export const updateLocation = async (req, res) => {
  try {
    const { lng, lat } = req.body;
    if (typeof lng !== "number" || typeof lat !== "number")
      return res.status(400).json({ message: "lng/lat required (numbers)" });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { location: { type: "Point", coordinates: [lng, lat] } },
      { new: true }
    ).select("-password");
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Find nearby providers within radiusKm (defaults 3km)
export const nearbyProviders = async (req, res) => {
  try {
    const { lng, lat, radiusKm = 3 } = req.query;
    if (lng === undefined || lat === undefined)
      return res.status(400).json({ message: "lng & lat are required" });

    const meters = Number(radiusKm) * 1000;
    const providers = await User.find({
      role: "provider",
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: meters
        }
      }
    }).select("-password");

    res.json({ providers });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Provider onboarding flags (mock; you’ll wire to uploads later)
export const submitOnboarding = async (req, res) => {
  try {
    const { documents = [], selfie = "", otpVerified = false } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { documents, selfie, otpVerified },
      { new: true }
    ).select("-password");
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
