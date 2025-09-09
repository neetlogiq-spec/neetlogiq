// Lightweight Vortex component for faster loading
import React, { useRef, useEffect } from 'react';
import { createNoise3D } from 'simplex-noise';

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
  const noise3D = createNoise3D();
  const tickRef = useRef(0);

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

    // Create lightweight particles with flow pattern
    const createParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          radius: baseRadius + Math.random() * rangeRadius,
          hue: baseHue + Math.random() * rangeHue,
          alpha: 0.3 + Math.random() * 0.5,
          life: 0,
          ttl: 100 + Math.random() * 200
        });
      }
    };

    const animate = () => {
      tickRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, index) => {
        // Use noise to create flowing pattern
        const xOff = 0.00125;
        const yOff = 0.00125;
        const zOff = 0.0005;
        const noiseSteps = 3;
        
        const n = noise3D(particle.x * xOff, particle.y * yOff, tickRef.current * zOff) * noiseSteps * Math.PI * 2;
        
        // Update velocity based on noise
        particle.vx = particle.vx * 0.5 + Math.cos(n) * 0.5;
        particle.vy = particle.vy * 0.5 + Math.sin(n) * 0.5;
        
        // Update position
        const speed = baseSpeed + Math.random() * rangeSpeed;
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;
        
        // Update life
        particle.life++;
        
        // Reset particle if it goes off screen or dies
        if (particle.x < 0 || particle.x > canvas.width || 
            particle.y < 0 || particle.y > canvas.height || 
            particle.life > particle.ttl) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.vx = 0;
          particle.vy = 0;
          particle.life = 0;
          particle.hue = baseHue + Math.random() * rangeHue;
        }
        
        // Draw particle with glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 2
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, ${particle.alpha})`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 60%, ${particle.alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 60%, 50%, 0)`);
        
        ctx.fillStyle = gradient;
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
