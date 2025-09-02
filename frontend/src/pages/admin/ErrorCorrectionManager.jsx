import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Eye, 
  Play,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  TestTube,
  Save,
  X
} from 'lucide-react';
import AdvancedSearch from '../../components/AdvancedSearch';

const ErrorCorrectionManager = () => {
  const [corrections, setCorrections] = useState([]);
  const [filteredCorrections, setFilteredCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  // Form states
  const [editingCorrection, setEditingCorrection] = useState(null);
  const [newCorrection, setNewCorrection] = useState({
    category: 'college_name',
    error_type: 'ocr_error',
    pattern: '',
    correction: '',
    description: '',
    priority: 'medium',
    context: '',
    examples: [''],
    regex_pattern: '',
    replacement: '',
    flags: 'g',
    notes: ''
  });
  
  // Test states
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState(null);
  
  // Stats states
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadCorrections();
  }, []);

  useEffect(() => {
    filterAndSortCorrections();
  }, [corrections, searchTerm, filterCategory, filterPriority, filterType, sortBy, sortOrder]);

  const loadCorrections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sector_xp_12/admin/error-corrections');
      if (response.ok) {
        const data = await response.json();
        setCorrections(data);
      }
    } catch (error) {
      console.error('Error loading corrections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/sector_xp_12/admin/error-corrections/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterAndSortCorrections = () => {
    let filtered = [...corrections];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(correction => 
        correction.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
        correction.correction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        correction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(correction => correction.category === filterCategory);
    }
    
    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(correction => correction.priority === filterPriority);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(correction => correction.error_type === filterType);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aVal = priorityOrder[a.priority] || 0;
          bVal = priorityOrder[b.priority] || 0;
          break;
        case 'usage_count':
          aVal = a.usage_count || 0;
          bVal = b.usage_count || 0;
          break;
        case 'success_rate':
          aVal = a.usage_count > 0 ? (a.success_count || 0) / a.usage_count : 0;
          bVal = b.usage_count > 0 ? (b.success_count || 0) / b.usage_count : 0;
          break;
        case 'created_at':
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
        default:
          aVal = a[sortBy] || '';
          bVal = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredCorrections(filtered);
  };

  const handleAddCorrection = async () => {
    try {
      const response = await fetch('/api/sector_xp_12/admin/error-corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCorrection,
          examples: newCorrection.examples.filter(ex => ex.trim() !== '')
        })
      });
      
      if (response.ok) {
        await loadCorrections();
        setShowAddModal(false);
        resetNewCorrection();
      }
    } catch (error) {
      console.error('Error adding correction:', error);
    }
  };

  const handleEditCorrection = async () => {
    try {
      const response = await fetch(`/api/sector_xp_12/admin/error-corrections/${editingCorrection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCorrection)
      });
      
      if (response.ok) {
        await loadCorrections();
        setShowEditModal(false);
        setEditingCorrection(null);
      }
    } catch (error) {
      console.error('Error updating correction:', error);
    }
  };

  const handleDeleteCorrection = async (id) => {
    if (!confirm('Are you sure you want to delete this correction rule?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/sector_xp_12/admin/error-corrections/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadCorrections();
      }
    } catch (error) {
      console.error('Error deleting correction:', error);
    }
  };

  const handleTestCorrection = async (correctionId) => {
    if (!testText.trim()) return;
    
    try {
      const response = await fetch(`/api/sector_xp_12/admin/error-corrections/${correctionId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleText: testText })
      });
      
      if (response.ok) {
        const result = await response.json();
        setTestResult(result);
      }
    } catch (error) {
      console.error('Error testing correction:', error);
    }
  };

  const resetNewCorrection = () => {
    setNewCorrection({
      category: 'college_name',
      error_type: 'ocr_error',
      pattern: '',
      correction: '',
      description: '',
      priority: 'medium',
      context: '',
      examples: [''],
      regex_pattern: '',
      replacement: '',
      flags: 'g',
      notes: ''
    });
  };

  const addExample = () => {
    setNewCorrection(prev => ({
      ...prev,
      examples: [...prev.examples, '']
    }));
  };

  const removeExample = (index) => {
    setNewCorrection(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index, value) => {
    setNewCorrection(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => i === index ? value : ex)
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ocr_error': return <AlertTriangle size={16} className="text-orange-500" />;
      case 'format_error': return <Settings size={16} className="text-blue-500" />;
      case 'ocr_duplication': return <XCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  const categories = [
    'college_name', 'program_name', 'location', 'quota', 'category'
  ];

  const priorities = ['critical', 'high', 'medium', 'low'];
  
  const errorTypes = ['ocr_error', 'format_error', 'ocr_duplication'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Error Correction Dictionary
              </h1>
              <p className="text-gray-600">
                Manage OCR errors, data inconsistencies, and correction rules for improved data quality
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowStatsModal(true);
                  loadStats();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200"
              >
                <BarChart3 size={20} />
                <span>Statistics</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 hover:scale-105"
              >
                <Plus size={20} />
                <span>Add Correction</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <AdvancedSearch
                placeholder="Search corrections..."
                data={corrections}
                searchFields={['pattern', 'correction', 'description', 'category']}
                onSearch={(results) => {
                  // Update search term based on results
                  const searchTermLower = results.length > 0 ? results[0].pattern.toLowerCase() : '';
                  setSearchTerm(searchTermLower);
                }}
                onClear={() => setSearchTerm('')}
                showAdvancedOptions={true}
                showSuggestions={true}
                maxSuggestions={5}
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority.toUpperCase()}</option>
              ))}
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {errorTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Corrections Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pattern
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCorrections.map((correction) => (
                  <tr key={correction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(correction.error_type)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {correction.pattern}
                          </div>
                          <div className="text-xs text-gray-500">
                            {correction.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {correction.correction}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {correction.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(correction.priority)}`}>
                        {correction.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {correction.usage_count || 0} uses
                      </div>
                      <div className="text-xs text-gray-500">
                        {correction.usage_count > 0 
                          ? `${Math.round((correction.success_count / correction.usage_count) * 100)}% success`
                          : 'No usage yet'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingCorrection(correction);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setTestResult(null);
                            setTestText('');
                            setShowTestModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Test"
                        >
                          <TestTube size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCorrection(correction.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCorrections.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No corrections found</h3>
              <p className="text-gray-500">Try adjusting your filters or add a new correction rule</p>
            </div>
          )}
        </div>

        {/* Add Correction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Add New Correction Rule</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newCorrection.category}
                    onChange={(e) => setNewCorrection({...newCorrection, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Error Type</label>
                  <select
                    value={newCorrection.error_type}
                    onChange={(e) => setNewCorrection({...newCorrection, error_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {errorTypes.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
                  <input
                    type="text"
                    value={newCorrection.pattern}
                    onChange={(e) => setNewCorrection({...newCorrection, pattern: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Text pattern to match"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correction</label>
                  <input
                    type="text"
                    value={newCorrection.correction}
                    onChange={(e) => setNewCorrection({...newCorrection, correction: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Corrected text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newCorrection.priority}
                    onChange={(e) => setNewCorrection({...newCorrection, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
                  <input
                    type="text"
                    value={newCorrection.context}
                    onChange={(e) => setNewCorrection({...newCorrection, context: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Where this correction applies"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newCorrection.description}
                  onChange={(e) => setNewCorrection({...newCorrection, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description of the error and correction"
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Examples</label>
                <div className="space-y-2">
                  {newCorrection.examples.map((example, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={example}
                        onChange={(e) => updateExample(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Example of the error"
                      />
                      {newCorrection.examples.length > 1 && (
                        <button
                          onClick={() => removeExample(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addExample}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Example
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regex Pattern (Optional)</label>
                  <input
                    type="text"
                    value={newCorrection.regex_pattern}
                    onChange={(e) => setNewCorrection({...newCorrection, regex_pattern: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Custom regex pattern"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Replacement (Optional)</label>
                  <input
                    type="text"
                    value={newCorrection.replacement}
                    onChange={(e) => setNewCorrection({...newCorrection, replacement: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Regex replacement pattern"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newCorrection.notes}
                  onChange={(e) => setNewCorrection({...newCorrection, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes or context"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCorrection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Add Correction
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Correction Modal */}
        {showTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Test Correction</h3>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Text</label>
                  <textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter text to test corrections on..."
                  />
                </div>
                
                <button
                  onClick={() => handleTestCorrection(editingCorrection?.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Test Corrections
                </button>
                
                {testResult && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Test Results</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Original:</strong> {testResult.original}</div>
                      <div><strong>Corrected:</strong> {testResult.corrected}</div>
                      <div><strong>Pattern:</strong> {testResult.pattern}</div>
                      <div><strong>Replacement:</strong> {testResult.replacement}</div>
                      <div><strong>Regex:</strong> {testResult.regex}</div>
                      <div><strong>Changed:</strong> {testResult.changed ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Modal */}
        {showStatsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Correction Statistics</h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-900">{stats.total_corrections}</div>
                    <div className="text-sm text-blue-600">Total Corrections</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-900">{stats.active_corrections}</div>
                    <div className="text-sm text-green-600">Active Corrections</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-900">{stats.total_usage}</div>
                    <div className="text-sm text-purple-600">Total Usage</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-900">
                      {Math.round(stats.success_rate * 100)}%
                    </div>
                    <div className="text-sm text-orange-600">Success Rate</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorCorrectionManager;
