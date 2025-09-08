// Lightweight Vortex component for faster loading
import React, { useRef, useEffect } from 'react';

const LightweightVortex = ({ 
  className = '', 
  particleCount = 50, 
  baseHue = 200, 
  rangeHue = 80,
  baseSpeed = 0.1,
  rangeSpeed = 0.5,
  baseRadius = 1,
  rangeRadius = 2,
  backgroundColor = '#ffffff'
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create lightweight particles
    const createParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (baseSpeed + Math.random() * rangeSpeed),
          vy: (Math.random() - 0.5) * (baseSpeed + Math.random() * rangeSpeed),
          radius: baseRadius + Math.random() * rangeRadius,
          hue: baseHue + Math.random() * rangeHue,
          alpha: 0.1 + Math.random() * 0.3
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.alpha})`;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, baseHue, rangeHue, baseSpeed, rangeSpeed, baseRadius, rangeRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-0 ${className}`}
      style={{ backgroundColor }}
    />
  );
};

export default LightweightVortex;
