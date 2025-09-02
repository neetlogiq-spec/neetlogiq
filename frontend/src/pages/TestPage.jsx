import React from 'react';
import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';
import ModernInput from '../components/ui/ModernInput';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Component Test Page</h1>
        
        <div className="space-y-8">
          {/* Test ModernCard */}
          <ModernCard className="p-6">
            <h2 className="text-2xl font-bold mb-4">ModernCard Test</h2>
            <p>This is a test of the ModernCard component.</p>
          </ModernCard>
          
          {/* Test ModernButton */}
          <ModernCard className="p-6">
            <h2 className="text-2xl font-bold mb-4">ModernButton Test</h2>
            <div className="space-x-4">
              <ModernButton variant="primary">Primary Button</ModernButton>
              <ModernButton variant="secondary">Secondary Button</ModernButton>
              <ModernButton variant="success">Success Button</ModernButton>
            </div>
          </ModernCard>
          
          {/* Test ModernInput */}
          <ModernCard className="p-6">
            <h2 className="text-2xl font-bold mb-4">ModernInput Test</h2>
            <ModernInput
              label="Test Input"
              placeholder="Enter some text..."
              className="mb-4"
            />
            <ModernInput
              label="Password Input"
              type="password"
              placeholder="Enter password..."
            />
          </ModernCard>
          
          {/* Test CSS Classes */}
          <ModernCard className="p-6">
            <h2 className="text-2xl font-bold mb-4">CSS Classes Test</h2>
            <div className="space-y-4">
              <div className="gradient-text">Gradient Text Test</div>
              <div className="glass-card p-4">Glass Card Test</div>
              <div className="modern-card p-4">Modern Card Test</div>
              <div className="btn-primary">Primary Button Class Test</div>
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
