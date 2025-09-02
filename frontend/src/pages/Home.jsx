import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  MapPin, 
  Users, 
  TrendingUp, 
  Award,
  BookOpen,
  Shield,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react';
import HeroSection from '../components/ui/HeroSection';
import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';

const Home = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: GraduationCap,
      title: "Comprehensive College Database",
      description: "Access detailed information about 2,400+ medical colleges across India with real-time data and insights.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Cutoff Analysis",
      description: "Get intelligent insights into admission trends, cutoff patterns, and success probability using advanced AI.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MapPin,
      title: "Location-Based Search",
      description: "Find colleges by state, city, or region with detailed location information and accessibility details.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Award,
      title: "Quality Rankings",
      description: "Compare colleges based on NMC rankings, infrastructure, faculty, and student success rates.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: BookOpen,
      title: "Course Information",
      description: "Detailed course details including curriculum, duration, specializations, and career prospects.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Shield,
      title: "Verified Data",
      description: "All information is verified and updated regularly from official sources and government databases.",
      color: "from-teal-500 to-blue-500"
    }
  ];

  const stats = [
    { icon: GraduationCap, value: "2,400+", label: "Medical Colleges", color: "text-blue-600" },
    { icon: MapPin, value: "28", label: "States Covered", color: "text-purple-600" },
    { icon: Users, value: "50,000+", label: "Students Helped", color: "text-green-600" },
    { icon: TrendingUp, value: "95%", label: "Success Rate", color: "text-orange-600" }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "MBBS Student",
      college: "AIIMS Delhi",
      content: "This platform helped me find the perfect medical college. The cutoff analysis was incredibly accurate!",
      rating: 5,
      avatar: "👩‍⚕️"
    },
    {
      name: "Rahul Kumar",
      role: "BDS Aspirant",
      college: "Manipal University",
      content: "The comprehensive database and location-based search made my college selection process so much easier.",
      rating: 5,
      avatar: "👨‍⚕️"
    },
    {
      name: "Anjali Patel",
      role: "Parent",
      college: "JIPMER Puducherry",
      content: "As a parent, I found the verified data and quality rankings extremely helpful for guiding my daughter's decision.",
      rating: 5,
      avatar: "👩‍👧‍👦"
    }
  ];

  const handleSearch = (query) => {
    console.log('Searching for:', query);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Find Your Perfect Medical College"
        subtitle="Discover top medical institutions across India with comprehensive data, AI-powered cutoffs, and expert insights to make your dream career a reality."
        searchPlaceholder="Search colleges, courses, or locations..."
        onSearch={handleSearch}
        stats={stats}
        background="gradient"
      />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">Our Platform</span>?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We provide the most comprehensive and intelligent medical college discovery platform in India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ModernCard
                  variant="elevated"
                  className="p-8 text-center h-full group cursor-pointer"
                  onClick={() => setActiveFeature(index)}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Trusted by <span className="gradient-text">Thousands</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our platform has helped countless students find their perfect medical college
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl mb-6 group-hover:shadow-2xl transition-all duration-300">
                  <stat.icon className={`w-10 h-10 ${stat.color}`} />
                </div>
                <div className="text-4xl font-bold text-neutral-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-neutral-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              What <span className="gradient-text">Students Say</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Real experiences from students who found their perfect medical college through our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ModernCard
                  variant="glass"
                  className="p-8 h-full"
                >
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-bold text-neutral-900">{testimonial.name}</h4>
                      <p className="text-sm text-neutral-600">{testimonial.role}</p>
                      <p className="text-sm text-primary-600 font-medium">{testimonial.college}</p>
                    </div>
                  </div>
                  
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="text-sm text-neutral-500">
                      Verified Student
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Find Your <span className="gradient-text-success">Dream College</span>?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have already discovered their perfect medical college through our platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ModernButton
                size="lg"
                variant="glass"
                onClick={() => window.location.href = '/colleges'}
                className="hover-lift"
              >
                Start Exploring
                <ArrowRight className="w-5 h-5 ml-2" />
              </ModernButton>
              <ModernButton
                size="lg"
                variant="secondary"
                onClick={() => window.location.href = '/sector_xp_12'}
                className="hover-lift"
              >
                Admin Access
              </ModernButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 gradient-text">Medical College Finder</h3>
              <p className="text-neutral-400">
                Your trusted partner in finding the perfect medical college across India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="/colleges" className="hover:text-white transition-colors">Colleges</a></li>
                <li><a href="/courses" className="hover:text-white transition-colors">Courses</a></li>
                <li><a href="/cutoffs" className="hover:text-white transition-colors">Cutoffs</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="/guide" className="hover:text-white transition-colors">Admission Guide</a></li>
                <li><a href="/rankings" className="hover:text-white transition-colors">College Rankings</a></li>
                <li><a href="/news" className="hover:text-white transition-colors">Latest News</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors cursor-pointer">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors cursor-pointer">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors cursor-pointer">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 Medical College Finder. All rights reserved. Built with ❤️ for medical aspirants.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
