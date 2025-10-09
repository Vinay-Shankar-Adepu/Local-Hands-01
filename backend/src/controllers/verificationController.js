import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";

/* ------------------------------------------------------------------
 ⚙️ Multer File Storage Setup
-------------------------------------------------------------------*/

const uploadDir = path.join(process.cwd(), "uploads", "dl");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user?.id || "anon"}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG, or PNG files are allowed"));
    }
    cb(null, true);
  },
});

/* ------------------------------------------------------------------
 🧾 Provider: Upload DL for Verification
-------------------------------------------------------------------*/
export const uploadDL = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please select an image first.",
      });
    }

    const userId = req.user.id;
    const fileUrl = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        "verificationDocs.dl": fileUrl,
        verificationStatus: "pending",
        verificationRemarks: "",
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Verification document uploaded successfully. Awaiting admin approval.",
      data: user,
    });
  } catch (err) {
    console.error("[uploadDL] Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while uploading verification document.",
    });
  }
};

/* ------------------------------------------------------------------
 🧾 Provider: Get Verification Status
-------------------------------------------------------------------*/
export const getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "verificationStatus verificationDocs verificationRemarks"
    );
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("[getVerificationStatus] Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch verification status." });
  }
};

/* ------------------------------------------------------------------
 🛡️ Admin: List Pending/Rejected Verifications
-------------------------------------------------------------------*/
export const getPendingVerifications = async (_req, res) => {
  try {
    const providers = await User.find({
      role: "provider",
      verificationStatus: { $in: ["pending", "rejected"] },
    }).select("name email phone verificationStatus verificationDocs verificationRemarks");

    res.status(200).json({ success: true, data: providers });
  } catch (err) {
    console.error("[getPendingVerifications] Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to load pending verifications." });
  }
};

/* ------------------------------------------------------------------
 🛡️ Admin: Approve Provider Verification
-------------------------------------------------------------------*/
export const approveVerification = async (req, res) => {
  try {
    const provider = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "verified", verificationRemarks: "" },
      { new: true }
    );

    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found." });

    res.status(200).json({
      success: true,
      message: "Provider verified successfully.",
      data: provider,
    });
  } catch (err) {
    console.error("[approveVerification] Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to approve verification." });
  }
};

/* ------------------------------------------------------------------
 🛡️ Admin: Reject Provider Verification
-------------------------------------------------------------------*/
export const rejectVerification = async (req, res) => {
  try {
    const { remarks } = req.body;

    const provider = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "rejected",
        verificationRemarks: remarks || "Document not clear or invalid.",
      },
      { new: true }
    );

    if (!provider)
      return res.status(404).json({ success: false, message: "Provider not found." });

    res.status(200).json({
      success: true,
      message: "Verification rejected successfully.",
      data: provider,
    });
  } catch (err) {
    console.error("[rejectVerification] Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to reject verification." });
  }
};
