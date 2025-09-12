import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Smile as Tooth, Upload, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";

const HeroSection = ({ containerVariants, itemVariants }) => {
  const { isAuthenticated, isAdmin, isPatient } = useAuth();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-teal-600/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto text-center">
        <motion.div variants={itemVariants}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-8"
          >
            <Tooth className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              DentalCare
            </span>
            <br />
            <span className="text-gray-900 text-4xl md:text-6xl">
              Annotation Platform
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Professional dental image analysis with AI-powered annotation tools
            and comprehensive reporting for better patient care.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {isAuthenticated ? (
              <>
                {isPatient && (
                  <Link to="/patient-portal">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-xl flex items-center space-x-2"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Go to Patient Portal</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin-dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-lg shadow-xl flex items-center space-x-2"
                    >
                      <Shield className="h-5 w-5" />
                      <span>Go to Admin Dashboard</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold text-lg shadow-xl flex items-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
