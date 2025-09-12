import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../utils/api";

const UploadForm = ({ user, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    patientName: user?.name || "",
    patientId: user?.patientId || "",
    email: user?.email || "",
    notes: "",
  });

  const [upperImage, setUpperImage] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    setFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!upperImage || !frontImage || !bottomImage) {
      toast.error("Please upload all three images");
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("upperImage", upperImage);
      data.append("frontImage", frontImage);
      data.append("bottomImage", bottomImage);
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));

      await api.post("/submissions", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Submission uploaded successfully!");
      setFormData({ ...formData, notes: "" });
      setUpperImage(null);
      setFrontImage(null);
      setBottomImage(null);
      onUploadSuccess();
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const fileFields = [
    { label: "Upper Teeth", file: upperImage, setFile: setUpperImage },
    { label: "Front Teeth", file: frontImage, setFile: setFrontImage },
    { label: "Bottom Teeth", file: bottomImage, setFile: setBottomImage },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-8 py-6">
        <div className="flex items-center space-x-3">
          <Upload className="h-6 w-6 text-white" />
          <h2 className="text-2xl font-bold text-white">Upload New Images</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Patient info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Patient Name
            </label>
            <input
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Patient ID</label>
            <input
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              required
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="input"
          />
        </div>

        {/* 3 file inputs */}
        {fileFields.map(({ label, file, setFile }, i) => (
          <div key={i}>
            <label className="block mb-2 text-sm font-medium">{label}</label>
            <input
              type="file"
              id={`file-${i}`}
              accept="image/*"
              onChange={(e) => handleFileChange(e, setFile)}
              className="hidden"
              required
            />
            <label htmlFor={`file-${i}`} className="file-drop">
              {file ? (
                <div className="text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-green-600">{file.name}</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Click to upload</p>
                </div>
              )}
            </label>
          </div>
        ))}

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="input"
          placeholder="Additional notes"
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={uploading}
          className="btn-primary"
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </motion.button>
      </form>
    </div>
  );
};

export default UploadForm;
