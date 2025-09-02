import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Crown,
  Star
} from 'lucide-react';
import AdvancedSearch from '../../components/AdvancedSearch';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample user data
  const users = [
    {
      id: 1,
      name: 'Lone_wolf#12',
      email: 'admin@neetlogiq.com',
      role: 'Super Admin',
      status: 'active',
      lastLogin: '2 hours ago',
      avatar: 'LW',
      permissions: ['all'],
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.j@medicalcollege.edu',
      role: 'College Admin',
      status: 'active',
      lastLogin: '1 day ago',
      avatar: 'SJ',
      permissions: ['colleges', 'cutoffs'],
      joinDate: '2024-03-20'
    },
    {
      id: 3,
      name: 'Prof. Rajesh Kumar',
      email: 'rajesh.k@dentalinstitute.org',
      role: 'Faculty',
      status: 'pending',
      lastLogin: 'Never',
      avatar: 'RK',
      permissions: ['view'],
      joinDate: '2024-05-10'
    },
    {
      id: 4,
      name: 'Dr. Maria Garcia',
      email: 'maria.g@healthcare.gov',
      role: 'Government Official',
      status: 'active',
      lastLogin: '3 days ago',
      avatar: 'MG',
      permissions: ['reports', 'analytics'],
      joinDate: '2024-02-08'
    },
    {
      id: 5,
      name: 'Dr. Ahmed Hassan',
      email: 'ahmed.h@dnbcenter.com',
      role: 'DNB Coordinator',
      status: 'inactive',
      lastLogin: '2 weeks ago',
      avatar: 'AH',
      permissions: ['dnb', 'cutoffs'],
      joinDate: '2024-04-12'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
                         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase().includes(selectedRole.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Super Admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'College Admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'Faculty':
        return <Star className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPermissionBadges = (permissions) => {
    return permissions.map(permission => (
      <span key={permission} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mr-1 mb-1">
        {permission}
      </span>
    ));
  };

  return (
    <div className="space-y-8">
      {/* Test Banner - Remove this after confirming UI works */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-xl text-center font-bold text-lg">
        👥 USERS PAGE LOADED SUCCESSFULLY! 👥
        <br />
        <span className="text-sm font-normal">This confirms the Users page is working</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-white/20 rounded-2xl">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-blue-100">Manage system users, roles, and permissions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Total Users</h3>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Active Users</h3>
            <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Pending</h3>
            <p className="text-2xl font-bold">{users.filter(u => u.status === 'pending').length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Roles</h3>
            <p className="text-2xl font-bold">{new Set(users.map(u => u.role)).size}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <AdvancedSearch
              placeholder="Search users..."
              data={users}
              searchFields={['name', 'email', 'role']}
              onSearch={(results) => {
                // Update filtered users based on search results
                const searchTermLower = results.length > 0 ? results[0].name.toLowerCase() : '';
                setSearchTerm(searchTermLower);
              }}
              onClear={() => setSearchTerm('')}
              showAdvancedOptions={true}
              showSuggestions={true}
              maxSuggestions={5}
            />
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="all">All Roles</option>
                <option value="super admin">Super Admin</option>
                <option value="college admin">College Admin</option>
                <option value="faculty">Faculty</option>
                <option value="government">Government Official</option>
                <option value="dnb">DNB Coordinator</option>
              </select>
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200">
            <UserPlus className="h-5 w-5" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">Joined {user.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm text-gray-900">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap">
                      {getPermissionBadges(user.permissions)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-yellow-600 hover:bg-yellow-100 rounded transition-colors">
                        {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105">
          <Mail className="h-5 w-5" />
          <span>Send Invites</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105">
          <Shield className="h-5 w-5" />
          <span>Manage Roles</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105">
          <Calendar className="h-5 w-5" />
          <span>Activity Log</span>
        </button>
        
        <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105">
          <Phone className="h-5 w-5" />
          <span>Contact Support</span>
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
