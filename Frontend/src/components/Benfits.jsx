import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";

const benefits = [
  "Secure image storage with Cloudinary ",
  "Professional annotation tools",
  "Instant PDF report generation",
  "Role-based access control",
  "Mobile-responsive design",
  "24/7 secure access",
];

const BenefitsSection = ({ containerVariants, itemVariants }) => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div variants={itemVariants}>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why Choose DentalCare?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Our platform combines cutting-edge technology with user-friendly
            design to deliver exceptional dental consultation experiences.
          </p>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-lg text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-8 rounded-3xl text-white shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>
            <blockquote className="text-xl mb-6 italic">
              "DentalCare has revolutionized our practice. The annotation tools
              are intuitive, and the automated reporting saves us hours of work
              every week."
            </blockquote>
            <cite className="text-blue-100">- Dr. Sarah Johnson, DDS</cite>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default BenefitsSection;
