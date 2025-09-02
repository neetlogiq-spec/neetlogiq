import React from 'react';
import SecureAdminWrapper from '../components/SecureAdminWrapper';
import AdminDashboard from './admin/AdminDashboard';

const SecureAdminDashboard = () => {
  return (
    <SecureAdminWrapper>
      <AdminDashboard />
    </SecureAdminWrapper>
  );
};

export default SecureAdminDashboard;
