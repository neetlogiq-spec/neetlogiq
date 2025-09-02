import React from 'react';
import { BarChart3, TrendingUp, Users, Building2, PieChart, Activity, Target, Zap } from 'lucide-react';

const Analytics = () => {
  const stats = [
    { 
      label: 'Total Colleges', 
      value: '2,399', 
      icon: Building2, 
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-100 to-indigo-100',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Active Students', 
      value: '45,000+', 
      icon: Users, 
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-100 to-emerald-100',
      textColor: 'text-green-600'
    },
    { 
      label: 'Success Rate', 
      value: '98.5%', 
      icon: TrendingUp, 
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-100 to-pink-100',
      textColor: 'text-purple-600'
    },
    { 
      label: 'Data Points', 
      value: '1.2M+', 
      icon: BarChart3, 
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-100 to-red-100',
      textColor: 'text-orange-600'
    }
  ];

  const features = [
    {
      title: 'Real-time Analytics',
      description: 'Live data updates and instant insights for informed decision making',
      icon: Activity,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Predictive Modeling',
      description: 'AI-powered forecasting to predict admission trends and success rates',
      icon: Target,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Interactive Charts',
      description: 'Dynamic visualizations and customizable dashboards for deep analysis',
      icon: PieChart,
      color: 'from-purple-500 to-pink-600'
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl mb-8 shadow-2xl animate-fade-in-down">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-down delay-200">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Analytics Dashboard
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-down delay-300">
            Comprehensive insights and <span className="font-semibold text-blue-600">AI-powered analytics</span> for medical college counseling and decision making
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Key Metrics
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real-time data and performance indicators
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500`}></div>
                  <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className={`text-3xl font-bold ${stat.textColor} mb-2`}>{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Advanced Features
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cutting-edge tools and capabilities for comprehensive analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500`}></div>
                  <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-xl hover:shadow-indigo-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics Coming Soon</h2>
                <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
                  We're working on powerful new features including detailed charts, trend analysis, 
                  admission predictions, and interactive dashboards. Stay tuned for the next generation 
                  of medical college analytics.
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm">
                  <Activity className="w-4 h-4 mr-2" />
                  In Development
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Insights Preview */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Data Insights
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover patterns and trends in medical education
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Admission Trends</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track historical admission patterns, cutoff trends, and success rates across different 
                  medical colleges and areas of focus.
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-orange-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Performance Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Analyze college performance metrics, student satisfaction scores, and placement 
                  statistics to make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
