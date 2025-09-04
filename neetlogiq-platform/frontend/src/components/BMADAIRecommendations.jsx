import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, Award, GraduationCap, Users, Clock, Star } from 'lucide-react';
import BMADAI from '../services/bmadAI';

const BMADAIRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [userProfile, setUserProfile] = useState({
    neetScore: 650,
    preferredStates: ['Delhi', 'Maharashtra', 'Karnataka'],
    budget: 500000,
    collegeType: 'Central University',
    interests: ['cardiology', 'surgery', 'research'],
    careerGoals: ['cardiologist', 'researcher'],
    academicStrengths: ['anatomy', 'physiology'],
    personalityType: 'analytical',
    targetScore: 700,
    timeAvailable: '12 months',
    weakSubjects: ['physics'],
    learningStyle: 'visual'
  });

  const bmadAI = new BMADAI();

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const aiRecommendations = await bmadAI.generateRecommendations(userProfile);
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white/80">🤖 BMAD AI is analyzing your profile...</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="text-center p-8">
        <p className="text-white/80">No recommendations available</p>
        <button
          onClick={generateRecommendations}
          className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Generate Recommendations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Brain className="w-6 h-6 text-primary-400 mr-2" />
          Your Profile
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">NEET Score</label>
            <input
              type="number"
              value={userProfile.neetScore}
              onChange={(e) => updateUserProfile('neetScore', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/20 rounded-lg border border-white/30 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-1">Target Score</label>
            <input
              type="number"
              value={userProfile.targetScore}
              onChange={(e) => updateUserProfile('targetScore', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/20 rounded-lg border border-white/30 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-1">Budget (₹)</label>
            <input
              type="number"
              value={userProfile.budget}
              onChange={(e) => updateUserProfile('budget', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/20 rounded-lg border border-white/30 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        </div>
        
        <button
          onClick={generateRecommendations}
          className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          🔄 Update Recommendations
        </button>
      </motion.div>

      {/* College Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <GraduationCap className="w-6 h-6 text-primary-400 mr-2" />
          AI-Recommended Colleges
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.colleges.map((college, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{college.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-400">{college.matchScore}%</div>
                  <div className="text-xs text-white/60">Match</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-white/70 mb-3">
                <div className="flex justify-between">
                  <span>State:</span>
                  <span>{college.state}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{college.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min Score:</span>
                  <span>{college.minScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fees:</span>
                  <span>₹{college.fees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>NIRF Rank:</span>
                  <span>#{college.nirfRank}</span>
                </div>
              </div>
              
              {/* AI Insights */}
              {college.aiInsights && college.aiInsights.length > 0 && (
                <div className="space-y-2">
                  {college.aiInsights.map((insight, insightIndex) => (
                    <div
                      key={insightIndex}
                      className={`text-xs p-2 rounded-lg ${
                        insight.type === 'success' ? 'bg-green-500/20 text-green-300' :
                        insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {insight.message}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Course Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Target className="w-6 h-6 text-primary-400 mr-2" />
          AI-Recommended Courses
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.courses.map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-400">{course.matchScore}%</div>
                  <div className="text-xs text-white/60">Match</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-white/70 mb-3">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Demand:</span>
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {Math.round(course.marketDemand * 100)}%
                  </span>
                </div>
              </div>
              
              {/* AI Insights */}
              {course.aiInsights && course.aiInsights.length > 0 && (
                <div className="space-y-2">
                  {course.aiInsights.map((insight, insightIndex) => (
                    <div
                      key={insightIndex}
                      className={`text-xs p-2 rounded-lg ${
                        insight.type === 'success' ? 'bg-green-500/20 text-green-300' :
                        insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {insight.message}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Career Path Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 text-primary-400 mr-2" />
          AI-Recommended Career Paths
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.careerPaths.map((path, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{path.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-400">
                    {Math.round(path.successProbability * 100)}%
                  </div>
                  <div className="text-xs text-white/60">Success</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-white/70 mb-3">
                <div className="flex justify-between">
                  <span>Timeline:</span>
                  <span>{path.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span>Salary:</span>
                  <span>{path.salary}</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Demand:</span>
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {Math.round(path.marketDemand * 100)}%
                  </span>
                </div>
              </div>
              
              {/* AI Insights */}
              {path.aiInsights && path.aiInsights.length > 0 && (
                <div className="space-y-2">
                  {path.aiInsights.map((insight, insightIndex) => (
                    <div
                      key={insightIndex}
                      className={`text-xs p-2 rounded-lg ${
                        insight.type === 'success' ? 'bg-green-500/20 text-green-300' :
                        insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {insight.message}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Study Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Clock className="w-6 h-6 text-primary-400 mr-2" />
          AI-Generated Study Plans
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.studyPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <h3 className="text-lg font-semibold text-white mb-3">{plan.name}</h3>
              
              <div className="space-y-2 text-sm text-white/70 mb-3">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{plan.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Schedule:</span>
                  <span>{plan.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weak Areas:</span>
                  <span>{plan.weakAreas.join(', ')}</span>
                </div>
              </div>
              
              {/* AI Insights */}
              {plan.aiInsights && plan.aiInsights.length > 0 && (
                <div className="space-y-2">
                  {plan.aiInsights.map((insight, insightIndex) => (
                    <div
                      key={insightIndex}
                      className={`text-xs p-2 rounded-lg ${
                        insight.type === 'success' ? 'bg-green-500/20 text-green-300' :
                        insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {insight.message}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Strategic Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Star className="w-6 h-6 text-primary-400 mr-2" />
          AI Strategic Insights
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Market Analysis</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>{recommendations.insights.marketAnalysis.summary}</p>
              <div className="mt-2">
                <p className="font-medium text-white">Emerging Fields:</p>
                <p>{recommendations.insights.marketAnalysis.emerging.join(', ')}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Strategic Recommendations</h3>
            <div className="space-y-2">
              {recommendations.insights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-white/70">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BMADAIRecommendations;
