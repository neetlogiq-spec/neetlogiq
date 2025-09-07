import React from 'react';
import { motion } from 'framer-motion';

const CollegeCardSkeleton = ({ index = 0 }) => {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      {/* College Image Skeleton */}
      <div className="w-full h-48 bg-white/20 rounded-xl mb-4 animate-pulse">
        <div className="w-full h-full bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-xl"></div>
      </div>

      {/* College Name Skeleton */}
      <div className="space-y-3 mb-4">
        <div className="h-6 bg-white/20 rounded-lg animate-pulse">
          <div className="w-3/4 h-full bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-lg"></div>
        </div>
        <div className="h-4 bg-white/15 rounded-md animate-pulse">
          <div className="w-1/2 h-full bg-gradient-to-r from-white/10 via-white/15 to-white/10 rounded-md"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-2">
          <div className="h-3 bg-white/15 rounded animate-pulse">
            <div className="w-2/3 h-full bg-gradient-to-r from-white/10 via-white/15 to-white/10 rounded"></div>
          </div>
          <div className="h-4 bg-white/20 rounded animate-pulse">
            <div className="w-1/2 h-full bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-white/15 rounded animate-pulse">
            <div className="w-2/3 h-full bg-gradient-to-r from-white/10 via-white/15 to-white/10 rounded"></div>
          </div>
          <div className="h-4 bg-white/20 rounded animate-pulse">
            <div className="w-1/2 h-full bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded"></div>
          </div>
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="h-10 bg-white/20 rounded-lg animate-pulse">
        <div className="w-full h-full bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-lg"></div>
      </div>
    </motion.div>
  );
};

export default CollegeCardSkeleton;