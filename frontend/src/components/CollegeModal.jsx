import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Building2, 
  MapPin, 
  Calendar, 
  GraduationCap,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CollegeModal = ({ isOpen, onClose, college = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    college_type: 'MEDICAL',
    management_type: 'PRIVATE',
    establishment_year: new Date().getFullYear(),
    university: '',
    total_courses: 0,
    total_seats: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const collegeTypes = [
    { value: 'MEDICAL', label: 'Medical College' },
    { value: 'DENTAL', label: 'Dental College' },
    { value: 'AYURVEDA', label: 'Ayurveda College' },
    { value: 'HOMEOPATHY', label: 'Homeopathy College' },
    { value: 'UNANI', label: 'Unani College' },
    { value: 'NURSING', label: 'Nursing College' },
    { value: 'PHARMACY', label: 'Pharmacy College' }
  ];

  const managementTypes = [
    { value: 'GOVERNMENT', label: 'Government' },
    { value: 'PRIVATE', label: 'Private' },
    { value: 'DEEMED', label: 'Deemed University' },
    { value: 'CENTRAL', label: 'Central University' },
    { value: 'STATE', label: 'State University' }
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
  ];

  useEffect(() => {
    if (college) {
      setFormData({
        name: college.name || '',
        city: college.city || '',
        state: college.state || '',
        college_type: college.college_type || 'MEDICAL',
        management_type: college.management_type || 'PRIVATE',
        establishment_year: college.establishment_year || new Date().getFullYear(),
        university: college.university || '',
        total_courses: college.total_programs || 0,
        total_seats: college.total_seats || 0
      });
    } else {
      setFormData({
        name: '',
        city: '',
        state: '',
        college_type: 'MEDICAL',
        management_type: 'PRIVATE',
        establishment_year: new Date().getFullYear(),
        university: '',
        total_courses: 0,
        total_seats: 0
      });
    }
    setError('');
    setSuccess('');
  }, [college, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Confirmation dialog before saving
    const action = college ? 'UPDATE' : 'CREATE';
    const collegeName = college ? college.name : formData.name;
    
    if (!confirm(`💾 ${action} COLLEGE CONFIRMATION\n\nYou are about to ${action.toLowerCase()} college:\n"${collegeName}"\n\nThis will ${college ? 'modify existing data' : 'add new data'} in the database.\n\nDo you want to proceed?`)) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get admin session for authentication
      const adminSession = localStorage.getItem('adminSession');
      console.log('Admin session:', adminSession);
      if (!adminSession) {
        throw new Error('No admin session found');
      }
      
      const session = JSON.parse(adminSession);
      const credentials = btoa(`${session.username}:${session.password}`);
      console.log('Making request to:', college ? `/api/sector_xp_12/colleges/${college.id}` : '/api/sector_xp_12/colleges');

      const url = college 
        ? `/api/sector_xp_12/colleges/${college.id}`
        : '/api/sector_xp_12/colleges';
      
      const method = college ? 'PUT' : 'POST';

      // Prepare data for submission - exclude calculated fields
      const submissionData = {
        name: formData.name,
        city: formData.city,
        state: formData.state,
        college_type: formData.college_type,
        management_type: formData.management_type,
        establishment_year: formData.establishment_year,
        university: formData.university
        // Note: total_courses and total_seats are excluded as they are calculated values
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const result = await response.json();
        const action = college ? 'updated' : 'created';
        const actionPast = college ? 'Updated' : 'Created';
        setSuccess(`✅ ${actionPast} Successfully!\n\nCollege "${collegeName}" has been ${action} in the database.`);
        
        setTimeout(() => {
          onSave && onSave(result.data);
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(`❌ Failed to ${college ? 'Update' : 'Create'} College\n\n${errorData.error || `Failed to ${college ? 'update' : 'create'} college`}`);
      }
    } catch (err) {
      setError(`❌ Error ${college ? 'Updating' : 'Creating'} College\n\n${err.message || `Error ${college ? 'updating' : 'creating'} college`}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white/90 backdrop-blur-xl rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-white/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {college ? 'Edit College' : 'Add New College'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* College Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                placeholder="Enter college name"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type and Management */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Type *
                </label>
                <select
                  name="college_type"
                  value={formData.college_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                >
                  {collegeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Management Type *
                </label>
                <select
                  name="management_type"
                  value={formData.management_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                >
                  {managementTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Establishment Year and University */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Establishment Year
                </label>
                <input
                  type="number"
                  name="establishment_year"
                  value={formData.establishment_year}
                  onChange={handleInputChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Year established"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University/Affiliation
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter university name"
                />
              </div>
            </div>

            {/* Courses and Seats - Read Only */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Programs (Calculated)
                </label>
                <input
                  type="number"
                  name="total_courses"
                  value={formData.total_courses}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Auto-calculated from database"
                />
                <p className="text-xs text-gray-500 mt-1">This value is calculated automatically from program data</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Seats (Calculated)
                </label>
                <input
                  type="number"
                  name="total_seats"
                  value={formData.total_seats}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Auto-calculated from database"
                />
                <p className="text-xs text-gray-500 mt-1">This value is calculated automatically from seat data</p>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{loading ? 'Saving...' : (college ? 'Update College' : 'Add College')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CollegeModal;
