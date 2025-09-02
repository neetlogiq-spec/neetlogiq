import React from 'react';
import { Vortex } from './ui/vortex';

const VortexDemo = () => {
  return (
    <div className="min-h-screen">
      <Vortex
        className="flex flex-col items-center justify-center px-2 py-4 w-full mx-auto"
        particleCount={800}
        baseHue={280}
        rangeHue={120}
        baseSpeed={0.2}
        rangeSpeed={2.0}
        baseRadius={1}
        rangeRadius={3}
        backgroundColor="#000000"
      >
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to NEET Logiq
          </h1>
          <p className="text-lg mb-8">
            Your comprehensive medical education platform
          </p>
          <div className="space-y-4">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Explore Courses
            </button>
            <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors ml-4">
              View Colleges
            </button>
          </div>
        </div>
      </Vortex>
    </div>
  );
};

export default VortexDemo;
