import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["patient", "admin"],
      default: "patient",
    },
    patientId: {
      type: String,
      unique: true,
      sparse: true,
      match: /^[A-Z0-9]+$/,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.role === "patient" && !this.patientId) {
    // Example format: PAT + random 6-digit alphanumeric
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.patientId = `PAT${randomStr}`;

    // Ensure uniqueness by checking DB
    const existing = await mongoose.models.User.findOne({
      patientId: this.patientId,
    });
    if (existing) {
      return next(new Error("Generated patientId already exists, try again"));
    }
  }
  next();
});


export default mongoose.model("User", userSchema);
