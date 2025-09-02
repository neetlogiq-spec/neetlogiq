import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Save, 
  TrendingUp, 
  Calendar, 
  Users, 
  Award, 
  Target,
  Zap,
  Sparkles,
  Crown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CutoffEditorModal = ({ isOpen, onClose, college, onSave }) => {
  console.log('🔍 CutoffEditorModal props:', { isOpen, college, onClose, onSave });
  const [cutoffs, setCutoffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCutoff, setNewCutoff] = useState({
    year: new Date().getFullYear(),
    category: 'GENERAL',
    total_seats: 0,
    closing_rank: 0,
    authority: 'NEET',
    quota: 'GENERAL',
    round: 1,
    program_name: '',
    cutoff_rank: 0,
    opening_rank: 0,
    seats_available: 0
  });

  // Animation refs
  const modalRef = useRef(null);
  const headerRef = useRef(null);
  const statsRefs = useRef([]);
  const formRef = useRef(null);
  const cutoffsRef = useRef(null);

  useEffect(() => {
    if (isOpen && college) {
      fetchCutoffs();
      // Trigger entrance animations
      animateModalEntrance();
    }
  }, [isOpen, college]);

  const animateModalEntrance = () => {
    // Modal entrance animation
    if (modalRef.current && window.anime) {
      window.anime.timeline()
        .add({
          targets: modalRef.current,
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 600,
          easing: 'easeOutCubic'
        })
        .add({
          targets: headerRef.current,
          opacity: [0, 1],
          translateY: [-30, 0],
          duration: 500,
          easing: 'easeOutCubic'
        }, '-=300')
        .add({
          targets: '.stats-card',
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 400,
          delay: window.anime.stagger(100),
          easing: 'easeOutCubic'
        }, '-=200')
        .add({
          targets: formRef.current,
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 500,
          easing: 'easeOutCubic'
        }, '-=200')
        .add({
          targets: cutoffsRef.current,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 400,
          easing: 'easeOutCubic'
        }, '-=100');
    }
  };

  const fetchCutoffs = async () => {
    try {
      setLoading(true);
      const credentials = btoa('Lone_wolf#12:Apx_gp_delta');
      
      const response = await fetch(`/api/sector_xp_12/colleges/${college.id}/cutoffs`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCutoffs(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching cutoffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewCutoff(prev => ({ ...prev, [field]: value }));
  };

  const addCutoff = () => {
    if (newCutoff.program_name && newCutoff.seats_available > 0) {
      const newCutoffWithId = { ...newCutoff, id: Date.now() };
      setCutoffs(prev => [...prev, newCutoffWithId]);
      
      // Animate new cutoff addition
      if (window.anime) {
        window.anime({
          targets: `.cutoff-card-${newCutoffWithId.id}`,
          opacity: [0, 1],
          scale: [0.8, 1],
          translateX: [-20, 0],
          duration: 400,
          easing: 'easeOutCubic'
        });
      }

      setNewCutoff({
        year: new Date().getFullYear(),
        category: 'GENERAL',
        total_seats: 0,
        closing_rank: 0,
        authority: 'NEET',
        quota: 'GENERAL',
        round: 1,
        program_name: '',
        cutoff_rank: 0,
        opening_rank: 0,
        seats_available: 0
      });
    }
  };

  const removeCutoff = (id) => {
    // Animate cutoff removal
    const cutoffElement = document.querySelector(`.cutoff-card-${id}`);
    if (cutoffElement && window.anime) {
      window.anime({
        targets: cutoffElement,
        opacity: [1, 0],
        scale: [1, 0.8],
        translateX: [0, 20],
        duration: 300,
        easing: 'easeInCubic',
        complete: () => {
          setCutoffs(prev => prev.filter(cutoff => cutoff.id !== id));
        }
      });
    } else {
      setCutoffs(prev => prev.filter(cutoff => cutoff.id !== id));
    }
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      const credentials = btoa('Lone_wolf#12:Apx_gp_delta');
      
      for (const cutoff of cutoffs) {
        const response = await fetch('/api/sector_xp_12/cutoffs', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...cutoff,
            college_id: college.id
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to save cutoff: ${response.statusText}`);
        }
      }

      // Success animation
      if (window.anime) {
        window.anime({
          targets: '.save-button',
          scale: [1, 1.1, 1],
          duration: 600,
          easing: 'easeInOutQuad'
        });
      }

      onSave(cutoffs);
    } catch (error) {
      console.error('Error saving cutoffs:', error);
      alert('Failed to save cutoffs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  console.log('🔍 Modal not open, returning null');

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        display: 'grid',
        placeItems: 'center',
        zIndex: 9999,
        height: '100vh',
        width: '100vw'
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden" 
        style={{ 
          display: 'block', 
          visibility: 'visible', 
          opacity: 1, 
          position: 'relative', 
          maxHeight: '90vh', 
          overflow: 'auto',
          zIndex: 10000
        }}
      >
        {/* Header */}
        <div ref={headerRef} className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white p-8">
          {/* Test Banner - Remove this after confirming UI works */}
          <div className="bg-gradient-to-r from-yellow-400 to-green-500 text-black p-2 rounded-xl text-center font-bold text-sm mb-4 z-20 relative">
            📊 NEW CUTOFF EDITOR UI LOADED! 📊
          </div>
          
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Cutoff Editor</h2>
                  <p className="text-orange-100 text-lg">{college?.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-2xl transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="stats-card bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <Target className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{cutoffs.length}</p>
                    <p className="text-orange-100 text-sm">Total Cutoffs</p>
                  </div>
                </div>
              </div>
              <div className="stats-card bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Users className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{cutoffs.reduce((sum, c) => sum + (c.seats_available || 0), 0)}</p>
                    <p className="text-orange-100 text-sm">Total Seats</p>
                  </div>
                </div>
              </div>
              <div className="stats-card bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <Award className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{cutoffs.filter(c => c.authority === 'NEET').length}</p>
                    <p className="text-orange-100 text-sm">NEET Cutoffs</p>
                  </div>
                </div>
              </div>
              <div className="stats-card bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-500/20 rounded-xl">
                    <Zap className="h-5 w-5 text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{cutoffs.filter(c => c.quota === 'GENERAL').length}</p>
                    <p className="text-orange-100 text-sm">General Quota</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Add New Cutoff Form */}
          <div ref={formRef} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">+ Add New Cutoff</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={newCutoff.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="2025"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newCutoff.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="GENERAL">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                    <option value="PWD">PWD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats *</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={newCutoff.total_seats}
                      onChange={(e) => handleInputChange('total_seats', parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closing Rank</label>
                  <input
                    type="number"
                    value={newCutoff.closing_rank}
                    onChange={(e) => handleInputChange('closing_rank', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Authority *</label>
                  <select
                    value={newCutoff.authority}
                    onChange={(e) => handleInputChange('authority', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="NEET">NEET</option>
                    <option value="AIIMS">AIIMS</option>
                    <option value="JIPMER">JIPMER</option>
                    <option value="STATE">State Level</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quota *</label>
                  <select
                    value={newCutoff.quota}
                    onChange={(e) => handleInputChange('quota', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="GENERAL">General</option>
                    <option value="STATE">State</option>
                    <option value="CENTRAL">Central</option>
                    <option value="ALL_INDIA">All India</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Round</label>
                  <input
                    type="number"
                    value={newCutoff.round}
                    onChange={(e) => handleInputChange('round', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Name *</label>
                  <input
                    type="text"
                    value={newCutoff.program_name}
                    onChange={(e) => handleInputChange('program_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., MBBS, BDS"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cutoff Rank</label>
                  <input
                    type="number"
                    value={newCutoff.cutoff_rank}
                    onChange={(e) => handleInputChange('cutoff_rank', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Rank</label>
                  <input
                    type="number"
                    value={newCutoff.opening_rank}
                    onChange={(e) => handleInputChange('opening_rank', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seats Available *</label>
                  <input
                    type="number"
                    value={newCutoff.seats_available}
                    onChange={(e) => handleInputChange('seats_available', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={addCutoff}
                disabled={!newCutoff.program_name || newCutoff.seats_available <= 0}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus className="h-5 w-5" />
                <span>+ Add Cutoff</span>
              </button>
            </div>
          </div>

          {/* Existing Cutoffs */}
          {cutoffs.length > 0 && (
            <div ref={cutoffsRef} className="bg-white rounded-3xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Existing Cutoffs</h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">{cutoffs.length} cutoff{cutoffs.length !== 1 ? 's' : ''} ready to save</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {cutoffs.map((cutoff, index) => (
                  <div 
                    key={cutoff.id || index} 
                    className={`cutoff-card-${cutoff.id} bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{cutoff.program_name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {cutoff.authority}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {cutoff.quota}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCutoff(cutoff.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Year:</span>
                        <span className="ml-2 font-medium">{cutoff.year}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 font-medium">{cutoff.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Seats:</span>
                        <span className="ml-2 font-medium">{cutoff.seats_available}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Round:</span>
                        <span className="ml-2 font-medium">{cutoff.round}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-600">Ready to save {cutoffs.length} cutoff{cutoffs.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={cutoffs.length === 0 || loading}
                className="save-button flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>{loading ? 'Saving...' : 'Save All Cutoffs'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CutoffEditorModal;
