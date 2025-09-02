import React from 'react';
import { Users, Target, Award, Globe, Sparkles, Building2, TrendingUp, Heart } from 'lucide-react';

const About = () => {
  const values = [
    { 
      title: 'Innovation', 
      description: 'Leading-edge technology and AI-powered solutions', 
      icon: Award,
      color: 'from-purple-500 to-pink-600'
    },
    { 
      title: 'Excellence', 
      description: 'Commitment to quality and continuous improvement', 
      icon: Target,
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      title: 'Integrity', 
      description: 'Trustworthy and transparent in all our operations', 
      icon: Globe,
      color: 'from-green-500 to-emerald-600'
    },
    { 
      title: 'Community', 
      description: 'Supporting students and educational institutions', 
      icon: Users,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-64 h-64 bg-gradient-to-tr from-indigo-400/15 to-pink-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-pink-600 rounded-3xl mb-8 shadow-2xl animate-fade-in-down">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-down delay-200">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              About NeetLogIQ
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-down delay-300">
            Leading platform revolutionizing medical education with <span className="font-semibold text-blue-600">AI-powered counseling</span> and <span className="font-semibold text-purple-600">advanced analytics</span>
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To democratize access to quality medical education by providing comprehensive, 
                  data-driven insights that help students make informed decisions about their future.
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  To become the most trusted platform for medical college counseling, 
                  empowering millions of students to achieve their dreams in healthcare.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Our Core Values
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${value.color} rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500`}></div>
                  <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                    <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-12 text-center text-white overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Our Impact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2">2,399+</div>
                  <div className="text-blue-100 text-lg">Colleges Listed</div>
                </div>
                <div className="group">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2">45,000+</div>
                  <div className="text-blue-100 text-lg">Students Helped</div>
                </div>
                <div className="group">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2">98.5%</div>
                  <div className="text-blue-100 text-lg">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Join Our Mission
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Be part of the revolution in medical education
            </p>
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 text-center shadow-xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Empowering Future Healthcare Leaders</h3>
              <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Every day, we work tirelessly to ensure that students have access to the best information, 
                tools, and guidance to make their medical education dreams a reality. Our commitment to 
                excellence drives us to continuously improve and innovate.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
