import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Eye,
  Download,
  Clock,
  FileCheck,
  CheckCircle,
} from "lucide-react";

const SubmissionCard = ({ submission, delay = 0 }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border hover:border-blue-300 shadow-sm"
    >
      {/* Header */}
      <div className="flex justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">
            {submission.patientName}
          </h3>
          <p className="text-sm text-gray-600">ID: {submission.patientId}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(submission.status)}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              submission.status
            )}`}
          >
            {submission.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <Calendar className="h-4 w-4 mr-2" />
        <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Notes */}
      {submission.notes && (
        <p className="text-sm text-gray-700 mb-4 bg-white rounded-md p-3 border border-gray-100">
          {submission.notes}
        </p>
      )}

      {/* Image Links */}
      <div className="flex flex-wrap gap-2">
        {[
          ["upperImageUrl", "Upper Image"],
          ["upperAnnotatedImageUrl", "Upper Annotation"],
          ["frontImageUrl", "Front Image"],
          ["frontAnnotatedImageUrl", "Front Annotation"],
          ["bottomImageUrl", "Bottom Image"],
          ["bottomAnnotatedImageUrl", "Bottom Annotation"],
        ].map(([key, label]) =>
          submission[key] ? (
            <motion.a
              key={key}
              href={submission[key]}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
            >
              <Eye className="h-4 w-4" /> <span>{label}</span>
            </motion.a>
          ) : null
        )}

        {submission.reportUrl && (
          <motion.a
            href={submission.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 hover:bg-green-200 transition"
          >
            <Download className="h-4 w-4" /> <span>Download Report</span>
          </motion.a>
        )}
      </div>
    </motion.div>
  );
};

export default SubmissionCard;
