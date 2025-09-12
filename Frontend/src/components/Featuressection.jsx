import React from "react";
import { motion } from "framer-motion";
import { Upload, Shield, FileText } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Upload dental images with patient details in seconds",
  },
  {
    icon: Shield,
    title: "Expert Review",
    description: "Professional annotation and analysis by dental experts",
  },
  {
    icon: FileText,
    title: "Detailed Reports",
    description: "Comprehensive PDF reports with annotations and findings",
  },
];

const FeaturesSection = ({ containerVariants, itemVariants }) => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Streamlined Dental Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform simplifies the dental consultation process with
            advanced annotation tools and automated reporting.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-blue-50 to-teal-50 p-8 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-xl w-fit mb-6">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;
