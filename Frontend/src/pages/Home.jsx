import React from "react";
import HeroSection from "../components/Herosection";
import FeaturesSection from "../components/Featuressection";
import BenefitsSection from "../components/Benfits";
import CTASection from "../components/ready";

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <div className="min-h-screen">
      <HeroSection
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
      <FeaturesSection
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
      <BenefitsSection
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
      <CTASection
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
    </div>
  );
};

export default Home;
