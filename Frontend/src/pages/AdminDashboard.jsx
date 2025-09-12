import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield,
  Eye,
  Edit3,
  FileText,
  Calendar,
  User,
  Download,
  CheckCircle,
  Clock,
  FileCheck,
} from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    uploaded: 0,
    annotated: 0,
    reported: 0,
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/submissions");
      setSubmissions(response.data.submissions);
      console.log(response.data);

      // Calculate stats
      const total = response.data.submissions.length;
      const uploaded = response.data.submissions.filter(
        (s) => s.status === "uploaded"
      ).length;
      const annotated = response.data.submissions.filter(
        (s) => s.status === "annotated"
      ).length;
      const reported = response.data.submissions.filter(
        (s) => s.status === "reported"
      ).length;
      setStats({ total, uploaded, annotated, reported });
    } catch (error) {
      toast.error("Failed to fetch submissions");
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async (submissionId) => {
    setGeneratingPdf((prev) => ({ ...prev, [submissionId]: true }));

    try {
      const response = await api.post(`/admin/generate-pdf/${submissionId}`);
      toast.success("PDF report generated successfully!");
      fetchSubmissions(); // Refresh the list
    } catch (error) {
      toast.error("Failed to generate PDF report");
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPdf((prev) => ({ ...prev, [submissionId]: false }));
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "annotated":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reported":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const statCards = [
    {
      title: "Total Submissions",
      count: stats.total,
      color: "from-blue-500 to-blue-600",
      icon: FileText,
    },
    {
      title: "Pending Review",
      count: stats.uploaded,
      color: "from-yellow-500 to-yellow-600",
      icon: Clock,
    },
    {
      title: "Annotated",
      count: stats.annotated,
      color: "from-purple-500 to-purple-600",
      icon: Edit3,
    },
    {
      title: "Completed",
      count: stats.reported,
      color: "from-green-500 to-green-600",
      icon: CheckCircle,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-orange-500 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Manage patient submissions and generate reports
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Welcome back, <span className="font-medium">{user?.name}</span>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.count}</p>
                </div>
                <stat.icon className="h-8 w-8 text-white/80" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Submissions Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              All Submissions
            </h2>
          </div>

          <div className="p-8">
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No submissions yet
                </h3>
                <p className="text-gray-600">
                  Patient submissions will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Patient
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((submission, index) => (
                      <motion.tr
                        key={submission._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition-all duration-300"
                      >
                        <td className="py-6 px-6">
                          <div>
                            <div className="flex items-center space-x-3">
                              <User className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {submission.patientName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ID: {submission.patientId}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {submission.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-6 px-6">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(submission.status)}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                submission.status
                              )}`}
                            >
                              {submission.status.toUpperCase()}
                            </span>
                          </div>
                        </td>

                        <td className="py-6 px-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              {new Date(
                                submission.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        <td className="py-6 px-6">
                          <div className="flex flex-wrap gap-2">
                            {/* View/Annotate Button */}
                            <Link to={`/annotate/${submission._id}`}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-300 text-sm font-medium"
                              >
                                {submission.status === "uploaded" ? (
                                  <>
                                    <Edit3 className="h-4 w-4" />
                                    <span>Annotate</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4" />
                                    <span>View</span>
                                  </>
                                )}
                              </motion.button>
                            </Link>

                            {/* Generate PDF Button */}
                            {submission.status === "annotated" &&
                              !submission.reportUrl && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    handleGeneratePdf(submission._id)
                                  }
                                  disabled={generatingPdf[submission._id]}
                                  className="inline-flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {generatingPdf[submission._id] ? (
                                    <>
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                          ease: "linear",
                                        }}
                                        className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full"
                                      />
                                      <span>Generating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="h-4 w-4" />
                                      <span>Generate PDF</span>
                                    </>
                                  )}
                                </motion.button>
                              )}

                            {/* Download PDF Button */}
                            {submission.reportUrl && (
                              <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href={submission.reportUrl}
                                target="_blank"
                                download={`DentalReport-${submission.patientId}.pdf`}
                                className="inline-flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-300 text-sm font-medium"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download PDF</span>
                              </motion.a>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
