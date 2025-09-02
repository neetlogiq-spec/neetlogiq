import React, { createContext, useContext, useState, useEffect } from 'react';

const AnimationContext = createContext();

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

export const AnimationProvider = ({ children }) => {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [animationPreferences, setAnimationPreferences] = useState({
    pageTransitions: true,
    hoverEffects: true,
    entranceAnimations: true,
    microInteractions: true,
    complexAnimations: true
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('animationPreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnimationsEnabled(parsed.enabled ?? true);
        setAnimationSpeed(parsed.speed ?? 1.0);
        setAnimationPreferences(parsed.preferences ?? animationPreferences);
      } catch (error) {
        console.warn('Failed to parse saved animation preferences:', error);
      }
    }
  }, []);

  useEffect(() => {
    const preferences = {
      enabled: animationsEnabled,
      speed: animationSpeed,
      preferences: animationPreferences
    };
    localStorage.setItem('animationPreferences', JSON.stringify(preferences));
  }, [animationsEnabled, animationSpeed, animationPreferences]);

  const toggleAnimations = () => {
    setAnimationsEnabled(prev => !prev);
  };

  const updateSpeed = (speed) => {
    setAnimationSpeed(Math.max(0.1, Math.min(3.0, speed)));
  };

  const updatePreference = (key, value) => {
    setAnimationPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getEffectiveAnimationState = (type) => {
    if (!animationsEnabled) return false;
    if (reducedMotion && type !== 'essential') return false;
    return animationPreferences[type] ?? true;
  };

  const value = {
    animationsEnabled,
    animationSpeed,
    reducedMotion,
    animationPreferences,
    toggleAnimations,
    updateSpeed,
    updatePreference,
    getEffectiveAnimationState,
    isPageTransitionsEnabled: () => getEffectiveAnimationState('pageTransitions'),
    isHoverEffectsEnabled: () => getEffectiveAnimationState('hoverEffects'),
    isEntranceAnimationsEnabled: () => getEffectiveAnimationState('entranceAnimations'),
    isMicroInteractionsEnabled: () => getEffectiveAnimationState('microInteractions'),
    isComplexAnimationsEnabled: () => getEffectiveAnimationState('complexAnimations'),
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};
