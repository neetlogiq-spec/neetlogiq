import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-6">
          <span className="gradient-text">MedGuide</span>
        </h1>
        <p className="text-xl text-neutral-600 mb-8">
          Your Gateway to Medical Education Excellence
        </p>
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">🎉 Success!</h2>
          <p className="text-lg text-neutral-700 mb-6">
            The React app is mounting correctly with the new MedGuide design!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-xl text-white">
              <h3 className="text-xl font-bold mb-2">2,400+</h3>
              <p>Medical Colleges</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl text-white">
              <h3 className="text-xl font-bold mb-2">28</h3>
              <p>States Covered</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-xl text-white">
              <h3 className="text-xl font-bold mb-2">50,000+</h3>
              <p>Students Helped</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
