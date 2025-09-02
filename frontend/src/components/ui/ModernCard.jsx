import React from 'react';
import { motion } from 'framer-motion';

const ModernCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  hoverEffect = true,
  animation = 'fadeInUp',
  delay = 0,
  ...props 
}) => {
  const variants = {
    fadeInUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -30 }
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 30 }
    },
    fadeInRight: {
      initial: { opacity: 0, x: 30 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -30 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    }
  };

  const cardVariants = {
    default: 'modern-card',
    glass: 'glass-card',
    elevated: 'modern-card shadow-2xl',
    bordered: 'modern-card border-2 border-primary-200'
  };

  return (
    <motion.div
      className={`${cardVariants[variant]} ${className}`}
      variants={variants[animation]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.6,
        delay: delay * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={hoverEffect ? {
        y: -8,
        transition: { duration: 0.2 }
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ModernCard;
