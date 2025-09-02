import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  GraduationCap,
  Building2,
  Users,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import CourseManagement from '../../components/CourseManagement';
import AdvancedSearch from '../../components/AdvancedSearch';

// Admin credentials for API calls
const ADMIN_CREDENTIALS = {
  username: 'Lone_wolf#12',
  password: 'Apx_gp_delta'
};

const Programs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [showCollegeSelector, setShowCollegeSelector] = useState(false);

  // Fetch colleges from API
  const fetchColleges = async () => {
    setLoading(true);
    try {
      const credentials = btoa(`${ADMIN_CREDENTIALS.username}:${ADMIN_CREDENTIALS.password}`);
      const response = await fetch('/api/sector_xp_12/colleges?limit=1000', {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Transform the data to match our expected format
          const transformedColleges = data.data.map(college => ({
            id: college.id,
            name: college.name,
            type: college.college_type || 'Unknown',
            programs: college.total_programs || 0,
            seats: college.total_seats || 0
          }));
          setColleges(transformedColleges);
        }
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for a specific college
  const fetchCourses = async (collegeName, collegeType) => {
    if (!collegeName || !collegeType) return;
    
    console.log('🔍 fetchCourses called with:', { collegeName, collegeType });
    setCoursesLoading(true);
    try {
      // Determine which database to query based on college type
      let dbEndpoint = '';
      if (collegeType.toUpperCase() === 'MEDICAL') {
        dbEndpoint = 'medical_seats';
      } else if (collegeType.toUpperCase() === 'DENTAL') {
        dbEndpoint = 'dental_seats';
      } else if (collegeType.toUpperCase() === 'DNB') {
        dbEndpoint = 'dnb_seats';
      } else {
        console.log('Unknown college type:', collegeType);
        setCourses([]);
        return;
      }

      console.log('🔍 Using endpoint:', dbEndpoint);
      const credentials = btoa(`${ADMIN_CREDENTIALS.username}:${ADMIN_CREDENTIALS.password}`);
              const url = `/api/sector_xp_12/${dbEndpoint}/courses?college_name=${encodeURIComponent(collegeName)}`;
      console.log('🔍 Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Response data:', data);
        if (data.success && data.data && data.data.courses) {
          console.log('🔍 Setting courses:', data.data.courses);
          console.log('🔍 Courses array length:', data.data.courses.length);
          setCourses(data.data.courses);
          console.log('🔍 Courses state should now be:', data.data.courses);
          console.log('🔍 About to call setCourses with:', data.data.courses);
        } else {
          console.log('🔍 No courses data found in response');
          console.log('🔍 data.success:', data.success);
          console.log('🔍 data.data:', data.data);
          console.log('🔍 data.data.courses:', data.data?.courses);
          setCourses([]);
        }
      } else {
        console.log('🔍 Response not ok, status:', response.status);
        const errorText = await response.text();
        console.log('🔍 Error response body:', errorText);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    // Load colleges data on component mount
    fetchColleges();
  }, []);

  // Auto-fetch courses when a college is selected
  useEffect(() => {
    if (selectedCollege) {
      console.log('🔍 useEffect: selectedCollege changed, fetching courses for:', selectedCollege);
      fetchCourses(selectedCollege.name, selectedCollege.type);
    }
  }, [selectedCollege]);

  const handleCollegeSelect = (college) => {
    console.log('🔍 handleCollegeSelect called with college:', college);
    setSelectedCollege(college);
    setShowCollegeSelector(false);
    // Fetch courses for the selected college
    console.log('🔍 About to call fetchCourses with:', college.name, college.type);
    fetchCourses(college.name, college.type);
  };

  const handleCourseUpdate = async (courseId, courseData) => {
    console.log('Updating course:', courseId, courseData);
    // Implement course update logic
  };

  const handleCourseDelete = async (courseId) => {
    console.log('Deleting course:', courseId);
    // Implement course deletion logic
  };

  const handleCourseCreate = async (collegeId, courseData) => {
    console.log('Creating course for college:', collegeId, courseData);
    // Implement course creation logic
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug log to see current state
  console.log('🔍 Component render - courses state:', courses, 'courses.length:', courses.length, 'selectedCollege:', selectedCollege);
  
  // Additional debugging for courses state
  useEffect(() => {
    console.log('🔍 Courses state changed:', courses);
    console.log('🔍 Courses array length:', courses.length);
    console.log('🔍 First course:', courses[0]);
  }, [courses]);
  
  // Final debug log before render
  console.log('🔍 FINAL RENDER - courses:', courses, 'length:', courses.length, 'selectedCollege:', selectedCollege);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Programs Management</h1>
            <p className="text-purple-100">Manage course programs and academic offerings</p>
          </div>
        </div>
      </div>

      {/* College Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Select College</h2>
          <div className="flex space-x-3">
            {selectedCollege && (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('🔍 Manual test: Fetching courses for:', selectedCollege.name, selectedCollege.type);
                    fetchCourses(selectedCollege.name, selectedCollege.type);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Test Fetch Courses
                </button>
                <button
                  onClick={() => {
                    console.log('🔍 Manual test: Setting test courses');
                    setCourses([{ id: 999, name: 'TEST COURSE', level: 'TEST', total_seats: 999 }]);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Set Test Course
                </button>
              </div>
            )}
            <button
              onClick={() => setShowCollegeSelector(!showCollegeSelector)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Building2 className="h-5 w-5" />
              <span>{selectedCollege ? 'Change College' : 'Select College'}</span>
            </button>
          </div>
        </div>

        {selectedCollege && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{selectedCollege.name}</h3>
                <p className="text-blue-700 text-sm">
                  {selectedCollege.type} College • {selectedCollege.programs} Programs • {selectedCollege.seats} Seats
                </p>
              </div>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selectedCollege.type}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* College Selector Modal */}
        {showCollegeSelector && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="mb-4">
              <AdvancedSearch
                placeholder="Search colleges..."
                data={colleges}
                searchFields={[
                  { text: 'name', weight: 10, type: 'college' },
                  { text: 'type', weight: 6, type: 'type' }
                ]}
                onSearch={(results) => {
                  // Update the filtered results
                  setFilteredColleges(results);
                }}
                onClear={() => {
                  // Reset to original data
                  setFilteredColleges(colleges);
                }}
                showAdvancedOptions={false}
                showSuggestions={true}
                maxSuggestions={6}
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredColleges.map((college) => (
                <button
                  key={college.id}
                  onClick={() => handleCollegeSelect(college)}
                  className="w-full text-left p-3 hover:bg-white rounded-lg border border-transparent hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{college.name}</p>
                      <p className="text-sm text-gray-600">
                        {college.type} • {college.programs} Programs • {college.seats} Seats
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {college.type}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Debug Info */}
      {selectedCollege && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-yellow-900 mb-2">Debug Info</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>Selected College: {selectedCollege.name}</p>
            <p>College Type: {selectedCollege.type}</p>
            <p>Courses State Length: {courses.length}</p>
            <p>Courses Loading: {coursesLoading ? 'Yes' : 'No'}</p>
            <p>Courses Data: {JSON.stringify(courses, null, 2)}</p>
          </div>
        </div>
      )}

      {/* Course Management */}
      {selectedCollege ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <CourseManagement
            collegeId={selectedCollege.id}
            collegeName={selectedCollege.name}
            courses={courses}
            loading={coursesLoading}
            onCourseUpdate={handleCourseUpdate}
            onCourseDelete={handleCourseDelete}
            onCourseCreate={handleCourseCreate}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No College Selected</h3>
            <p className="text-gray-600 mb-6">
              Please select a college above to manage its programs and courses.
            </p>
            <button
              onClick={() => setShowCollegeSelector(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Building2 className="h-5 w-5" />
              <span>Select College</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Add New Program</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Create new academic programs and courses for colleges
          </p>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Create Program
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Export Data</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Export program data to CSV or Excel format
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Programs
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Import Data</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Import program data from CSV or Excel files
          </p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Import Programs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Programs;
