import React, { useState } from 'react';
import BeautifulLoader from './BeautifulLoader';

const LoadingDemo = () => {
  const [showFullscreen, setShowFullscreen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Beautiful Loading Animation Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Small Loader */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 text-center">Small Loader</h3>
            <div className="flex justify-center">
              <BeautifulLoader size="small" showText={false} />
            </div>
            <p className="text-center text-sm text-gray-300 mt-4">
              Perfect for buttons and inline elements
            </p>
          </div>

          {/* Medium Loader */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 text-center">Medium Loader</h3>
            <div className="flex justify-center">
              <BeautifulLoader size="medium" showText={false} />
            </div>
            <p className="text-center text-sm text-gray-300 mt-4">
              Ideal for content areas and forms
            </p>
          </div>

          {/* Large Loader */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 text-center">Large Loader</h3>
            <div className="flex justify-center">
              <BeautifulLoader size="large" showText={false} />
            </div>
            <p className="text-center text-sm text-gray-300 mt-4">
              Great for full-page loading states
            </p>
          </div>

          {/* Loader with Text */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 text-center">With Text</h3>
            <div className="flex justify-center">
              <BeautifulLoader size="medium" showText={true} text="Loading data..." />
            </div>
            <p className="text-center text-sm text-gray-300 mt-4">
              Includes descriptive loading message
            </p>
          </div>

          {/* Button Loading State */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 text-center">Button Loading</h3>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
              <div className="w-5 h-5 mr-2">
                <BeautifulLoader size="small" showText={false} />
              </div>
              Processing...
            </button>
            <p className="text-center text-sm text-gray-300 mt-4">
              Integrated into button components
            </p>
          </div>

          {/* Backdrop Loading */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 text-center">Backdrop Style</h3>
            <div className="flex justify-center">
              <div className="loading-backdrop">
                <BeautifulLoader size="medium" showText={true} text="Loading with backdrop..." />
              </div>
            </div>
            <p className="text-center text-sm text-gray-300 mt-4">
              With backdrop blur effect
            </p>
          </div>
        </div>

        {/* Fullscreen Loading Demo */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowFullscreen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-8 rounded-xl transition-colors text-lg"
          >
            Show Fullscreen Loading
          </button>
        </div>

        {/* Fullscreen Overlay */}
        {showFullscreen && (
          <div className="fullscreen-loading">
            <div className="text-center">
              <BeautifulLoader size="large" showText={true} text="Loading fullscreen..." />
              <button
                onClick={() => setShowFullscreen(false)}
                className="mt-8 bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-white/30"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="mt-16 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6 text-center">Technical Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-blue-400 mb-3">Features</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Smooth CSS animations with keyframes</li>
                <li>• Responsive sizing (small, medium, large)</li>
                <li>• Optional loading text</li>
                <li>• Dark mode support</li>
                <li>• Customizable via CSS variables</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400 mb-3">Usage</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Import BeautifulLoader component</li>
                <li>• Choose size: small, medium, large</li>
                <li>• Toggle text: showText={true/false}</li>
                <li>• Custom text: text="Your message"</li>
                <li>• Add className for styling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDemo;
