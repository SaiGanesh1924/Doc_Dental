import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";

const Ready = ({ containerVariants, itemVariants }) => {
  const { isAuthenticated } = useAuth();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-20 bg-gradient-to-r from-blue-600 to-teal-600"
    >
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 text-white">
        <motion.div variants={itemVariants}>
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Dental Practice?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of dental professionals who trust DentalCare for
            their annotation and reporting needs.
          </p>

          {!isAuthenticated && (
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl flex items-center space-x-2 mx-auto"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Ready;
