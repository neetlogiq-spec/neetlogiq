import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Car, 
  CircuitBoard,
  Grid3X3,
  Sparkles,
  Palette,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AnimationPlayground = () => {
  const [activeAnimation, setActiveAnimation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  
  const { isComplexAnimationsEnabled } = useAnimation();
  
  const playgroundRef = useRef(null);
  const animationRefs = useRef({});

  // Animation configurations
  const animations = {
    circuitRacing: {
      name: "Circuit Racing",
      icon: Car,
      description: "Cars racing on animated circuits with motion paths",
      category: "racing"
    },
    gridStagger: {
      name: "Grid Stagger",
      icon: Grid3X3,
      description: "13x13 grid with staggered scale animations",
      category: "grid"
    },
    drawingCircuit: {
      name: "Drawing Circuit",
      icon: CircuitBoard,
      description: "SVG circuit drawing with progressive reveal",
      category: "drawing"
    },
    particleExplosion: {
      name: "Particle Explosion",
      icon: Sparkles,
      description: "Explosive particle system with physics",
      category: "particles"
    },
    morphingShapes: {
      name: "Morphing Shapes",
      icon: Palette,
      description: "Smooth shape morphing between forms",
      category: "morphing"
    }
  };

  // Initialize Anime.js when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.anime) {
      // Store anime reference
      animationRefs.current.anime = window.anime;
    }
  }, []);

  // Load Anime.js dynamically
  useEffect(() => {
    const loadAnimeJS = async () => {
      try {
        const anime = await import('animejs');
        animationRefs.current.anime = anime.default;
      } catch (error) {
        console.warn('Failed to load Anime.js:', error);
      }
    };

    if (!animationRefs.current.anime) {
      loadAnimeJS();
    }
  }, []);

  const startAnimation = async (animationType) => {
    if (!isComplexAnimationsEnabled()) {
      alert('Complex animations are disabled. Enable them in the animation controls!');
      return;
    }

    if (!animationRefs.current.anime) {
      alert('Anime.js is still loading. Please wait a moment and try again.');
      return;
    }

    setActiveAnimation(animationType);
    setIsPlaying(true);

    const anime = animationRefs.current.anime;
    const container = playgroundRef.current;

    // Stop any existing animations
    anime.remove('.playground-element');

    switch (animationType) {
      case 'circuitRacing':
        await runCircuitRacing(anime, container);
        break;
      case 'gridStagger':
        await runGridStagger(anime, container);
        break;
      case 'drawingCircuit':
        await runDrawingCircuit(anime, container);
        break;
      case 'particleExplosion':
        await runParticleExplosion(anime, container);
        break;
      case 'morphingShapes':
        await runMorphingShapes(anime, container);
        break;
      default:
        break;
    }
  };

  const runCircuitRacing = async (anime, container) => {
    // Create circuit path
    const circuit = container.querySelector('.circuit-path');
    if (!circuit) return;

    // Create cars
    const cars = Array.from({ length: 3 }, (_, i) => {
      const car = document.createElement('div');
      car.className = 'playground-element car';
      car.innerHTML = '🚗';
      car.style.cssText = `
        position: absolute;
        font-size: 24px;
        z-index: 10;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      `;
      container.appendChild(car);
      return car;
    });

    // Animate cars along the circuit
    const timeline = anime.timeline({
      easing: 'easeInOutSine',
      duration: 3000 / animationSpeed
    });

    cars.forEach((car, index) => {
      timeline.add({
        targets: car,
        ...anime.createMotionPath(circuit),
        duration: 4000 / animationSpeed,
        delay: index * 500,
        loop: true,
        direction: 'alternate'
      });
    });

    // Animate circuit drawing
    anime({
      targets: circuit,
      strokeDasharray: [0, circuit.getTotalLength()],
      strokeDashoffset: [0, -circuit.getTotalLength()],
      duration: 2000 / animationSpeed,
      easing: 'easeInOutSine',
      loop: true,
      direction: 'alternate'
    });
  };

  const runGridStagger = async (anime, container) => {
    // Create 13x13 grid
    const gridSize = 13;
    const grid = document.createElement('div');
    grid.className = 'playground-element grid-container';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${gridSize}, 1fr);
      gap: 8px;
      width: 100%;
      height: 100%;
      padding: 20px;
    `;

    // Create dots
    for (let i = 0; i < gridSize * gridSize; i++) {
      const dot = document.createElement('div');
      dot.className = 'playground-element grid-dot';
      dot.style.cssText = `
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      `;
      grid.appendChild(dot);
    }

    container.appendChild(grid);

    // Staggered animation
    const options = {
      grid: [gridSize, gridSize],
      from: 'center'
    };

    anime({
      targets: '.grid-dot',
      scale: anime.stagger([1.1, 0.75], options),
      opacity: anime.stagger([1, 0.3], options),
      rotate: anime.stagger([0, 360], options),
      duration: 1500 / animationSpeed,
      delay: anime.stagger(100, options),
      easing: 'inOutQuad',
      loop: true,
      direction: 'alternate'
    });
  };

  const runDrawingCircuit = async (anime, container) => {
    // Create SVG circuit
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.cssText = 'position: absolute; top: 0; left: 0;';

    const circuitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    circuitPath.setAttribute('d', 'M50,100 Q150,50 250,100 T450,100 Q550,150 650,100');
    circuitPath.setAttribute('fill', 'none');
    circuitPath.setAttribute('stroke', '#667eea');
    circuitPath.setAttribute('stroke-width', '4');
    circuitPath.setAttribute('stroke-linecap', 'round');
    circuitPath.className = 'playground-element circuit-draw';

    svg.appendChild(circuitPath);
    container.appendChild(svg);

    // Drawing animation
    anime({
      targets: '.circuit-draw',
      strokeDasharray: [0, circuitPath.getTotalLength()],
      duration: 3000 / animationSpeed,
      easing: 'easeInOutSine',
      loop: true,
      direction: 'alternate'
    });
  };

  const runParticleExplosion = async (anime, container) => {
    // Create particles
    const particles = Array.from({ length: 50 }, (_, i) => {
      const particle = document.createElement('div');
      particle.className = 'playground-element particle';
      particle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 5;
      `;
      container.appendChild(particle);
      return particle;
    });

    // Explosion animation
    anime({
      targets: '.particle',
      translateX: anime.stagger(anime.random(-200, 200)),
      translateY: anime.stagger(anime.random(-200, 200)),
      scale: anime.stagger([0, 1, 0]),
      opacity: anime.stagger([1, 0]),
      duration: 2000 / animationSpeed,
      easing: 'easeOutExpo',
      loop: true,
      delay: anime.stagger(50)
    });
  };

  const runMorphingShapes = async (anime, container) => {
    // Create SVG for morphing
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.cssText = 'position: absolute; top: 0; left: 0;';

    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('fill', 'url(#gradient)');
    shape.className = 'playground-element morphing-shape';

    // Add gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'gradient');
    gradient.innerHTML = `
      <stop offset="0%" stop-color="#667eea"/>
      <stop offset="100%" stop-color="#764ba2"/>
    `;
    defs.appendChild(gradient);
    svg.appendChild(defs);
    svg.appendChild(shape);
    container.appendChild(svg);

    // Morphing animation
    const paths = [
      'M50,50 L150,50 L150,150 L50,150 Z', // Square
      'M100,50 L150,100 L100,150 L50,100 Z', // Diamond
      'M100,50 A50,50 0 1,1 100,150 A50,50 0 1,1 100,50 Z', // Circle
      'M50,100 L150,50 L150,150 Z' // Triangle
    ];

    anime({
      targets: '.morphing-shape',
      d: paths,
      duration: 2000 / animationSpeed,
      easing: 'easeInOutQuad',
      loop: true,
      direction: 'alternate'
    });
  };

  const stopAnimation = () => {
    if (animationRefs.current.anime) {
      animationRefs.current.anime.remove('.playground-element');
    }
    setIsPlaying(false);
    setActiveAnimation(null);
  };

  const resetPlayground = () => {
    stopAnimation();
    if (playgroundRef.current) {
      playgroundRef.current.innerHTML = '';
    }
  };

  const getAnimationIcon = (animationType) => {
    const Icon = animations[animationType]?.icon || Play;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          🎮 Animation Playground
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          When you're bored in the admin panel, unleash your creativity with these interactive animations!
          Powered by Anime.js for stunning visual effects.
        </motion.p>
      </div>

      {/* Animation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(animations).map(([key, animation]) => (
          <motion.div
            key={key}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * Object.keys(animations).indexOf(key) }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                  {getAnimationIcon(key)}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{animation.name}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{animation.description}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => startAnimation(key)}
                  disabled={activeAnimation === key && isPlaying}
                  className={`
                    flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all
                    ${activeAnimation === key && isPlaying
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    }
                  `}
                >
                  {activeAnimation === key && isPlaying ? 'Playing...' : 'Play'}
                </button>
                
                {activeAnimation === key && (
                  <button
                    onClick={stopAnimation}
                    className="py-2 px-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-500" />
            Animation Controls
          </h3>
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showControls ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Speed:</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 w-12">{animationSpeed}x</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetPlayground}
                  className="flex items-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </button>
                
                <button
                  onClick={stopAnimation}
                  disabled={!isPlaying}
                  className="flex items-center gap-2 py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pause className="w-4 h-4" />
                  Stop All
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Animation Playground */}
      <motion.div
        ref={playgroundRef}
        className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden"
        style={{ height: '500px' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {/* Circuit Path for Racing */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            className="circuit-path"
            d="M100,100 Q200,50 300,100 T500,100 Q600,150 700,100"
            fill="none"
            stroke="rgba(102, 126, 234, 0.3)"
            strokeWidth="3"
            strokeDasharray="10,5"
          />
        </svg>

        {/* Default Message */}
        {!activeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-white/70">
            <div>
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-xl font-medium mb-2">Ready to Animate?</p>
              <p className="text-sm">Choose an animation from above to get started!</p>
            </div>
          </div>
        )}

        {/* Animation Status */}
        {activeAnimation && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Playing: {animations[activeAnimation]?.name}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center mt-8 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-sm">
          Powered by <span className="font-medium text-purple-600">Anime.js</span> • 
          Created for admin entertainment 🎭
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AnimationPlayground;
