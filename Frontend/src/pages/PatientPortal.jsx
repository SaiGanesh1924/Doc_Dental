import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Calendar,
  Eye,
  Download,
  CheckCircle,
  Clock,
  FileCheck,
} from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import SubmissionList from "../components/Patientportal/SubmissionList";

const PatientPortal = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: user?.name || "",
    patientId: user?.patientId || "",
    email: user?.email || "",
    notes: "",
  });

  const [upperImage, setUpperImage] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/submissions/my-submissions");
      setSubmissions(response.data.submissions);
    } catch (error) {
      toast.error("Failed to fetch submissions");
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!upperImage || !frontImage || !bottomImage) {
      toast.error("Please upload all three images");
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("upperImage", upperImage);
      formDataToSend.append("frontImage", frontImage);
      formDataToSend.append("bottomImage", bottomImage);
      formDataToSend.append("patientName", formData.patientName);
      formDataToSend.append("patientId", formData.patientId);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("notes", formData.notes);

      const response = await api.post("/submissions", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Submission uploaded successfully!");
      setFormData({ ...formData, notes: "" });
      setUpperImage(null);
      setFrontImage(null);
      setBottomImage(null);
      fetchSubmissions();
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploaded":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "annotated":
        return <FileCheck className="h-5 w-5 text-blue-500" />;
      case "reported":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "uploaded":
        return "bg-yellow-100 text-yellow-800";
      case "annotated":
        return "bg-blue-100 text-blue-800";
      case "reported":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Patient Portal
          </h1>
          <p className="text-xl text-gray-600">
            Upload your dental images and track your submissions
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Upload className="h-6 w-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">
                    Upload New Images
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter patient name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter patient ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter email address"
                  />
                </div>

                {/* 3 Image Uploads */}
                {[
                  {
                    label: "Upper Teeth",
                    file: upperImage,
                    setFile: setUpperImage,
                  },
                  {
                    label: "Front Teeth",
                    file: frontImage,
                    setFile: setFrontImage,
                  },
                  {
                    label: "Bottom Teeth",
                    file: bottomImage,
                    setFile: setBottomImage,
                  },
                ].map(({ label, file, setFile }, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setFile)}
                        className="hidden"
                        id={`file-upload-${idx}`}
                        required
                      />
                      <label
                        htmlFor={`file-upload-${idx}`}
                        className="flex items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                      >
                        <div className="text-center">
                          {file ? (
                            <div>
                              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                              <p className="text-sm text-green-600 font-medium">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Click to change
                              </p>
                            </div>
                          ) : (
                            <div>
                              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-sm text-gray-600">
                                Click to upload
                              </p>
                              <p className="text-xs text-gray-500">
                                Max size: 10MB
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Add any additional notes or symptoms..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={uploading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    "Upload Images"
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Submissions List */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">My Submissions</h2>
            </div>
            <div className="p-8">
              <SubmissionList submissions={submissions} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientPortal;
