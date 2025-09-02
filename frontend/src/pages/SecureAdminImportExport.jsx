import React from 'react';
import SecureAdminWrapper from '../components/SecureAdminWrapper';
import ModernImportExport from './admin/ModernImportExport';

const SecureAdminImportExport = () => {
  return (
    <SecureAdminWrapper>
      <ModernImportExport />
    </SecureAdminWrapper>
  );
};

export default SecureAdminImportExport;
