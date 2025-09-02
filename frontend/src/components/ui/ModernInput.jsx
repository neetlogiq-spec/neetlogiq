import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Search, X } from 'lucide-react';

const ModernInput = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onClear,
  error,
  success,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'modern-input w-full transition-all duration-300';
  
  const variants = {
    default: 'border-neutral-200 focus:border-primary-400',
    success: 'border-success-300 focus:border-success-500',
    error: 'border-error-300 focus:border-error-500',
    warning: 'border-warning-300 focus:border-warning-500'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const inputClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    
    return (
      <span className={`${iconPosition === 'left' ? 'mr-3' : 'ml-3'} text-neutral-400 ${isFocused ? 'text-primary-500' : ''}`}>
        {icon}
      </span>
    );
  };

  const renderPasswordToggle = () => {
    if (type !== 'password') return null;
    
    return (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    );
  };

  const renderClearButton = () => {
    if (!onClear || !value) return null;
    
    return (
      <button
        type="button"
        onClick={onClear}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    );
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="relative">
      {label && (
        <motion.label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700 mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {iconPosition === 'left' && renderIcon()}
        
        <motion.input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          style={{
            paddingLeft: iconPosition === 'left' && icon ? '3rem' : undefined,
            paddingRight: (type === 'password' || onClear) ? '3rem' : undefined
          }}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          {...props}
        />
        
        {iconPosition === 'right' && renderIcon()}
        {renderPasswordToggle()}
        {renderClearButton()}
        
        {/* Focus indicator */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{
            scale: isFocused ? 1 : 0.95,
            opacity: isFocused ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          style={{
            border: '2px solid',
            borderColor: isFocused ? 'var(--primary-400)' : 'transparent'
          }}
        />
      </div>
      
      {/* Status messages */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`mt-2 text-sm font-medium ${
              error ? 'text-error-600' : 'text-success-600'
            }`}
          >
            {error || success}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading indicator */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex items-center space-x-2"
        >
          <div className="loading-spinner w-4 h-4"></div>
          <span className="text-sm text-neutral-500">Loading...</span>
        </motion.div>
      )}
    </div>
  );
};

// Search Input variant
export const SearchInput = ({ onSearch, ...props }) => {
  const [searchValue, setSearchValue] = useState('');
  
  const handleSearch = () => {
    if (onSearch) onSearch(searchValue);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <ModernInput
      {...props}
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onKeyPress={handleKeyPress}
      icon={<Search className="w-5 h-5" />}
      placeholder="Search..."
      onClear={() => setSearchValue('')}
    />
  );
};

// Textarea variant
export const ModernTextarea = ({ rows = 4, ...props }) => {
  return (
    <ModernInput
      {...props}
      as="textarea"
      rows={rows}
      className="resize-none"
    />
  );
};

export default ModernInput;
