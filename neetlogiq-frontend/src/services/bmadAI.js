// BMAD AI - Medical Intelligence Platform
// Provides intelligent recommendations for colleges, courses, and career paths

class BMADAI {
  constructor() {
    this.userProfile = null;
    this.recommendationEngine = null;
    this.learningModel = null;
    this.initializeAI();
  }

  async initializeAI() {
    try {
      // Initialize AI components
      this.recommendationEngine = new RecommendationEngine();
      this.learningModel = new LearningModel();
      
      console.log('🤖 BMAD AI initialized successfully');
    } catch (error) {
      console.error('❌ BMAD AI initialization failed:', error);
    }
  }

  // Analyze user profile and generate personalized recommendations
  async generateRecommendations(userProfile) {
    try {
      this.userProfile = userProfile;
      
      // Call the real backend API for AI recommendations
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://neetlogiq-backend.neetlogiq.workers.dev'}/api/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('🤖 BMAD AI recommendations generated successfully');
        return data.recommendations;
      } else {
        throw new Error(data.error || 'Failed to generate recommendations');
      }
    } catch (error) {
      console.error('❌ Recommendation generation failed:', error);
      // Fallback to simulated recommendations if API fails
      return await this.generateFallbackRecommendations();
    }
  }

  // Fallback recommendations if API fails
  async generateFallbackRecommendations() {
    console.log('🔄 Using fallback recommendations...');
    
    return {
      colleges: await this.recommendColleges(),
      courses: await this.recommendCourses(),
      careerPaths: await this.recommendCareerPaths(),
      studyPlans: await this.generateStudyPlans(),
      insights: await this.generateInsights()
    };
  }

  // Recommend colleges based on user preferences and scores
  async recommendColleges() {
    const { neetScore, preferredStates, budget, collegeType } = this.userProfile;
    
    // AI-powered college matching algorithm
    const recommendations = await this.recommendationEngine.matchColleges({
      score: neetScore,
      states: preferredStates,
      budget: budget,
      type: collegeType,
      preferences: this.userProfile.preferences
    });

    return recommendations.map(college => ({
      ...college,
      matchScore: this.calculateMatchScore(college, this.userProfile),
      aiInsights: this.generateCollegeInsights(college, this.userProfile)
    }));
  }

  // Recommend courses based on user interests and career goals
  async recommendCourses() {
    const { interests, careerGoals, academicStrengths } = this.userProfile;
    
    const recommendations = await this.recommendationEngine.matchCourses({
      interests: interests,
      goals: careerGoals,
      strengths: academicStrengths,
      marketDemand: await this.getMarketDemand()
    });

    return recommendations.map(course => ({
      ...course,
      matchScore: this.calculateCourseMatch(course, this.userProfile),
      careerProspects: this.analyzeCareerProspects(course),
      aiInsights: this.generateCourseInsights(course, this.userProfile)
    }));
  }

  // Generate personalized career path recommendations
  async recommendCareerPaths() {
    const { neetScore, interests, personalityType } = this.userProfile;
    
    const careerPaths = await this.recommendationEngine.analyzeCareerPaths({
      score: neetScore,
      interests: interests,
      personality: personalityType,
      marketTrends: await this.getMarketTrends()
    });

    return careerPaths.map(path => ({
      ...path,
      successProbability: this.calculateSuccessProbability(path, this.userProfile),
      timeline: this.generateCareerTimeline(path),
      aiInsights: this.generateCareerInsights(path, this.userProfile)
    }));
  }

  // Generate personalized study plans
  async generateStudyPlans() {
    const { neetScore, targetScore, timeAvailable, weakSubjects } = this.userProfile;
    
    const studyPlans = await this.learningModel.createStudyPlan({
      currentScore: neetScore,
      targetScore: targetScore,
      timeAvailable: timeAvailable,
      weakAreas: weakSubjects,
      learningStyle: this.userProfile.learningStyle
    });

    return studyPlans.map(plan => ({
      ...plan,
      effectiveness: this.calculatePlanEffectiveness(plan),
      aiInsights: this.generateStudyInsights(plan, this.userProfile)
    }));
  }

  // Generate AI-powered insights
  async generateInsights() {
    const insights = {
      marketAnalysis: await this.analyzeMarketTrends(),
      competitiveAnalysis: await this.analyzeCompetition(),
      opportunities: await this.identifyOpportunities(),
      risks: await this.identifyRisks(),
      recommendations: await this.generateStrategicRecommendations()
    };

    return insights;
  }

  // Calculate match score for colleges
  calculateMatchScore(college, userProfile) {
    let score = 0;
    
    // Score based on NEET score compatibility
    if (userProfile.neetScore >= college.minScore) {
      score += 30;
    }
    
    // Score based on preferred states
    if (userProfile.preferredStates.includes(college.state)) {
      score += 25;
    }
    
    // Score based on budget compatibility
    if (college.fees <= userProfile.budget) {
      score += 20;
    }
    
    // Score based on college type preference
    if (userProfile.collegeType === college.type) {
      score += 15;
    }
    
    // Score based on college ranking
    score += Math.max(0, 10 - college.nirfRank);
    
    return Math.min(100, score);
  }

  // Calculate match score for courses
  calculateCourseMatch(course, userProfile) {
    let score = 0;
    
    // Score based on interest alignment
    const interestMatch = this.calculateInterestAlignment(course, userProfile.interests);
    score += interestMatch * 40;
    
    // Score based on career goal alignment
    const goalMatch = this.calculateGoalAlignment(course, userProfile.careerGoals);
    score += goalMatch * 30;
    
    // Score based on academic strengths
    const strengthMatch = this.calculateStrengthAlignment(course, userProfile.academicStrengths);
    score += strengthMatch * 20;
    
    // Score based on market demand
    score += course.marketDemand * 10;
    
    return Math.min(100, score);
  }

  // Calculate success probability for career paths
  calculateSuccessProbability(careerPath, userProfile) {
    let probability = 0.5; // Base probability
    
    // Adjust based on NEET score
    if (userProfile.neetScore >= careerPath.minScore) {
      probability += 0.2;
    }
    
    // Adjust based on interest alignment
    const interestAlignment = this.calculateInterestAlignment(careerPath, userProfile.interests);
    probability += interestAlignment * 0.15;
    
    // Adjust based on personality fit
    const personalityFit = this.calculatePersonalityFit(careerPath, userProfile.personalityType);
    probability += personalityFit * 0.1;
    
    // Adjust based on market demand
    probability += careerPath.marketDemand * 0.05;
    
    return Math.min(1, Math.max(0, probability));
  }

  // Helper methods for calculations
  calculateInterestAlignment(item, interests) {
    const commonInterests = item.tags.filter(tag => interests.includes(tag));
    return commonInterests.length / Math.max(item.tags.length, interests.length);
  }

  calculateGoalAlignment(item, goals) {
    const alignedGoals = goals.filter(goal => item.careerOutcomes.includes(goal));
    return alignedGoals.length / Math.max(goals.length, item.careerOutcomes.length);
  }

  calculateStrengthAlignment(item, strengths) {
    const relevantStrengths = strengths.filter(strength => item.requiredSkills.includes(strength));
    return relevantStrengths.length / Math.max(strengths.length, item.requiredSkills.length);
  }

  calculatePersonalityFit(careerPath, personalityType) {
    const personalityMatches = {
      'introvert': ['research', 'pathology', 'radiology'],
      'extrovert': ['surgery', 'emergency', 'pediatrics'],
      'analytical': ['research', 'pathology', 'cardiology'],
      'creative': ['psychiatry', 'dermatology', 'plastic-surgery']
    };
    
    const matches = personalityMatches[personalityType] || [];
    return matches.some(match => careerPath.tags.includes(match)) ? 1 : 0;
  }

  // Generate AI insights for colleges
  generateCollegeInsights(college, userProfile) {
    const insights = [];
    
    if (userProfile.neetScore < college.minScore) {
      insights.push({
        type: 'warning',
        message: `Your NEET score is ${college.minScore - userProfile.neetScore} points below the minimum requirement. Consider improving your score or exploring alternative colleges.`
      });
    }
    
    if (college.fees > userProfile.budget) {
      insights.push({
        type: 'info',
        message: `This college's fees exceed your budget by ₹${(college.fees - userProfile.budget).toLocaleString()}. Consider scholarship opportunities or financial aid.`
      });
    }
    
    if (college.nirfRank <= 10) {
      insights.push({
        type: 'success',
        message: `This is a top-tier medical college (NIRF Rank #${college.nirfRank}). Excellent choice for ambitious students!`
      });
    }
    
    return insights;
  }

  // Generate AI insights for courses
  generateCourseInsights(course, userProfile) {
    const insights = [];
    
    const interestMatch = this.calculateInterestAlignment(course, userProfile.interests);
    if (interestMatch > 0.8) {
      insights.push({
        type: 'success',
        message: `This course perfectly aligns with your interests (${Math.round(interestMatch * 100)}% match)!`
      });
    }
    
    if (course.marketDemand > 0.8) {
      insights.push({
        type: 'info',
        message: `High market demand for this specialization. Excellent career prospects!`
      });
    }
    
    return insights;
  }

  // Generate AI insights for career paths
  generateCareerInsights(careerPath, userProfile) {
    const insights = [];
    
    const successProb = this.calculateSuccessProbability(careerPath, userProfile);
    if (successProb > 0.8) {
      insights.push({
        type: 'success',
        message: `High success probability (${Math.round(successProb * 100)}%) for this career path!`
      });
    } else if (successProb < 0.4) {
      insights.push({
        type: 'warning',
        message: `Lower success probability (${Math.round(successProb * 100)}%). Consider additional preparation or alternative paths.`
      });
    }
    
    return insights;
  }

  // Generate AI insights for study plans
  generateStudyInsights(plan, userProfile) {
    const insights = [];
    
    if (plan.duration > userProfile.timeAvailable) {
      insights.push({
        type: 'warning',
        message: `This study plan requires more time than you have available. Consider an accelerated version or adjust your timeline.`
      });
    }
    
    if (plan.weakAreas.length > 0) {
      insights.push({
        type: 'info',
        message: `Focus on improving ${plan.weakAreas.join(', ')} to maximize your NEET score.`
      });
    }
    
    return insights;
  }

  // Get market demand data
  async getMarketDemand() {
    // Simulated market demand data
    return {
      'cardiology': 0.9,
      'radiology': 0.85,
      'surgery': 0.8,
      'pediatrics': 0.75,
      'psychiatry': 0.7,
      'pathology': 0.65
    };
  }

  // Get market trends
  async getMarketTrends() {
    // Simulated market trends
    return {
      'emerging': ['telemedicine', 'genomics', 'AI-in-medicine'],
      'declining': ['traditional-pathology', 'general-practice'],
      'stable': ['cardiology', 'surgery', 'pediatrics']
    };
  }

  // Analyze market trends
  async analyzeMarketTrends() {
    const trends = await this.getMarketTrends();
    return {
      summary: 'Medical field is evolving with technology integration',
      emerging: trends.emerging,
      declining: trends.declining,
      stable: trends.stable,
      recommendations: 'Focus on technology-enabled specializations'
    };
  }

  // Analyze competition
  async analyzeCompetition() {
    return {
      summary: 'Competition is high in top medical colleges',
      topColleges: 'Extremely competitive (1-100 rank)',
      midColleges: 'Moderately competitive (101-500 rank)',
      recommendations: 'Target colleges matching your score range'
    };
  }

  // Identify opportunities
  async identifyOpportunities() {
    return {
      emergingFields: ['AI Medicine', 'Genomics', 'Telemedicine'],
      scholarships: 'Multiple scholarship programs available',
      international: 'Opportunities for international medical education',
      recommendations: 'Explore emerging fields and scholarship opportunities'
    };
  }

  // Identify risks
  async identifyRisks() {
    return {
      scoreRisk: 'NEET score below target college requirements',
      financialRisk: 'College fees exceed budget',
      competitionRisk: 'High competition in preferred colleges',
      recommendations: 'Have backup options and improve weak areas'
    };
  }

  // Generate strategic recommendations
  async generateStrategicRecommendations() {
    return [
      'Focus on improving weak subjects to increase NEET score',
      'Research and apply for scholarships and financial aid',
      'Consider multiple college options across different states',
      'Stay updated with emerging medical specializations',
      'Build a strong foundation in basic sciences'
    ];
  }
}

// Recommendation Engine Class
class RecommendationEngine {
  async matchColleges(criteria) {
    // Simulated college matching algorithm
    return [
      {
        name: 'All India Institute of Medical Sciences, Delhi',
        state: 'Delhi',
        type: 'Central University',
        minScore: 700,
        fees: 15000,
        nirfRank: 1,
        tags: ['research', 'cardiology', 'surgery']
      },
      {
        name: 'JIPMER Puducherry',
        state: 'Puducherry',
        type: 'Central University',
        minScore: 680,
        fees: 20000,
        nirfRank: 2,
        tags: ['research', 'pediatrics', 'emergency']
      }
    ];
  }

  async matchCourses(criteria) {
    // Simulated course matching algorithm
    return [
      {
        name: 'MD in Cardiology',
        duration: '3 Years',
        marketDemand: 0.9,
        tags: ['cardiology', 'heart', 'interventional'],
        careerOutcomes: ['cardiologist', 'researcher', 'professor'],
        requiredSkills: ['anatomy', 'physiology', 'pharmacology']
      },
      {
        name: 'MS in General Surgery',
        duration: '3 Years',
        marketDemand: 0.8,
        tags: ['surgery', 'operating', 'trauma'],
        careerOutcomes: ['surgeon', 'consultant', 'researcher'],
        requiredSkills: ['anatomy', 'surgical-skills', 'decision-making']
      }
    ];
  }

  async analyzeCareerPaths(criteria) {
    // Simulated career path analysis
    return [
      {
        name: 'Clinical Cardiologist',
        minScore: 650,
        tags: ['cardiology', 'clinical', 'patient-care'],
        marketDemand: 0.9,
        timeline: '8-10 years',
        salary: '₹15-25 LPA'
      },
      {
        name: 'Research Scientist',
        minScore: 600,
        tags: ['research', 'academia', 'innovation'],
        marketDemand: 0.7,
        timeline: '6-8 years',
        salary: '₹8-15 LPA'
      }
    ];
  }
}

// Learning Model Class
class LearningModel {
  async createStudyPlan(criteria) {
    // Simulated study plan generation
    return [
      {
        name: 'Comprehensive NEET Preparation',
        duration: '12 months',
        weakAreas: ['physics', 'chemistry'],
        subjects: ['physics', 'chemistry', 'biology'],
        schedule: '6-8 hours daily',
        milestones: ['monthly-tests', 'mock-exams', 'revision-cycles']
      },
      {
        name: 'Fast-track Preparation',
        duration: '6 months',
        weakAreas: ['biology'],
        subjects: ['physics', 'chemistry', 'biology'],
        schedule: '8-10 hours daily',
        milestones: ['bi-weekly-tests', 'intensive-revision', 'practice-exams']
      }
    ];
  }
}

export default BMADAI;
