import React from "react";
import { FileText } from "lucide-react";
import SubmissionCard from "./submissionCard";

const SubmissionList = ({ submissions, loading }) => {
  if (loading) {
    return <div className="text-center py-12">Loading submissions...</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No submissions yet
        </h3>
        <p className="text-gray-600">
          Upload your first dental images to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((s, i) => (
        <SubmissionCard key={s._id} submission={s} delay={i * 0.1} />
      ))}
    </div>
  );
};

export default SubmissionList;
