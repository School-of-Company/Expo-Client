import React from 'react';
import { AdminProfile } from '@/entities/admin';
import { TableForm } from '@/shared/ui/Table';

const AdminPageWrapper = () => {
  return (
    <div className="space-y-[73px]">
      <AdminProfile />
      <div className="space-y-[26px]">
        <p className="text-h2 text-black">등록된 박람회</p>
        <div className="h-[662px]">
          <TableForm footerType="default" />
        </div>
      </div>
    </div>
  );
};

export default AdminPageWrapper;
