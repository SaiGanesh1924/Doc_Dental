import Submission from "../models/Submission.model.js";
import cloudinary from "../libs/cloudinary.js";

export const createSubmission = async (req, res) => {
  try {
    const { patientName, patientId, email, notes } = req.body;

    console.log("Files received:", req.files);

    // Expect 3 image files
    if (
      !req.files ||
      !req.files.upperImage ||
      !req.files.frontImage ||
      !req.files.bottomImage
    ) {
      return res.status(400).json({
        message: "All 3 image files (upper, front, bottom) are required",
      });
    }

    // Upload each image to Cloudinary
    const upperResult = await cloudinary.uploader.upload(
      req.files.upperImage[0].path,
      { folder: "Oralvis_subs" }
    );
    const frontResult = await cloudinary.uploader.upload(
      req.files.frontImage[0].path,
      { folder: "Oralvis_subs" }
    );
    const bottomResult = await cloudinary.uploader.upload(
      req.files.bottomImage[0].path,
      { folder: "Oralvis_subs" }
    );

    // Save submission with all 3 image URLs
    const submission = new Submission({
      patient: req.user._id,
      patientName,
      patientId,
      email,
      notes,
      upperImageUrl: upperResult.secure_url,
      frontImageUrl: frontResult.secure_url,
      bottomImageUrl: bottomResult.secure_url,
      status: "uploaded",
    });

    await submission.save();

    res.status(201).json({
      message: "Submission created successfully",
      submission,
    });
  } catch (error) {
    console.error("Submission creation error:", error);
    res.status(500).json({ message: "Error creating submission" });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ patient: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Error fetching submissions" });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate(
      "patient",
      "name email"
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (
      req.user.role !== "admin" &&
      submission.patient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ submission });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ message: "Error fetching submission" });
  }
};
