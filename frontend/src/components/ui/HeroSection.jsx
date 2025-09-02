import React from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, MapPin, Users } from 'lucide-react';
import ModernInput from './ModernInput';
import ModernButton from './ModernButton';

const HeroSection = ({ 
  title = "Find Your Perfect Medical College",
  subtitle = "Discover top medical institutions across India with comprehensive data, cutoffs, and insights",
  searchPlaceholder = "Search colleges, courses, or locations...",
  onSearch,
  stats = [],
  background = "gradient",
  className = ""
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const backgroundVariants = {
    gradient: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
    glass: "glass-card",
    solid: "bg-white",
    dark: "bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white"
  };

  const defaultStats = [
    { icon: GraduationCap, value: "2,400+", label: "Medical Colleges" },
    { icon: MapPin, value: "28", label: "States Covered" },
    { icon: Users, value: "50,000+", label: "Students Helped" }
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <section className={`relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 ${backgroundVariants[background]} ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative max-w-7xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Title */}
        <motion.h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          variants={itemVariants}
        >
          <span className="gradient-text">{title}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-xl sm:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          {subtitle}
        </motion.p>

        {/* Search Section */}
        <motion.div 
          className="max-w-2xl mx-auto mb-16"
          variants={itemVariants}
        >
          <div className="relative">
            <ModernInput
              placeholder={searchPlaceholder}
              size="lg"
              className="text-center text-lg shadow-2xl"
              icon={<Search className="w-6 h-6" />}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && onSearch) {
                  onSearch(e.target.value);
                }
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                border: '2px solid',
                borderColor: 'rgba(59, 130, 246, 0.2)',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.1)'
              }}
            />
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => onSearch && onSearch("MBBS")}
              className="hover-lift"
            >
              MBBS
            </ModernButton>
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => onSearch && onSearch("BDS")}
              className="hover-lift"
            >
              BDS
            </ModernButton>
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => onSearch && onSearch("Government")}
              className="hover-lift"
            >
              Government
            </ModernButton>
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => onSearch && onSearch("Private")}
              className="hover-lift"
            >
              Private
            </ModernButton>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
          variants={itemVariants}
        >
          {displayStats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-4 group-hover:shadow-xl transition-all duration-300">
                <stat.icon className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                {stat.value}
              </div>
              <div className="text-neutral-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="mt-16"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ModernButton
              size="lg"
              onClick={() => window.location.href = '/colleges'}
              className="hover-lift"
            >
              Explore Colleges
            </ModernButton>
            <ModernButton
              variant="secondary"
              size="lg"
              onClick={() => window.location.href = '/sector_xp_12'}
              className="hover-lift"
            >
              Admin Panel
            </ModernButton>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-60"
        animate={{
          y: [0, -20, 0],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full opacity-60"
        animate={{
          y: [0, -15, 0],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-2 h-2 bg-indigo-400 rounded-full opacity-60"
        animate={{
          y: [0, -10, 0],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </section>
  );
};

export default HeroSection;
