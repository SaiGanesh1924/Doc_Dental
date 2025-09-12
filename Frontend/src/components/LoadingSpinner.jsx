import React from "react";
import { motion } from "framer-motion";
import { SmileIcon as Tooth } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-4"
        >
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4 rounded-full">
            <Tooth className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading...
          </h2>
          <p className="text-gray-500">
            Please wait while we prepare your experience
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
