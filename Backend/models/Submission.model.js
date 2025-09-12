import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },

    // ============
    // Original images (3)
    // ============
    upperImageUrl: {
      type: String,
      required: true,
    },
    frontImageUrl: {
      type: String,
      required: true,
    },
    bottomImageUrl: {
      type: String,
      required: true,
    },

    // ============
    // Annotated images (3)
    // ============
    upperAnnotatedImageUrl: {
      type: String,
      default: null,
    },
    frontAnnotatedImageUrl: {
      type: String,
      default: null,
    },
    bottomAnnotatedImageUrl: {
      type: String,
      default: null,
    },

    // Optional annotation data (if you store drawing coordinates etc.)
    annotationData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    reportUrl: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["uploaded", "annotated", "reported"],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Submission", submissionSchema);
