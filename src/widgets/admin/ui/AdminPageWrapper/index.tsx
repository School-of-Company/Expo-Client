import React from 'react';
import { AdminProfile } from '@/entities/admin';
import { TableForm } from '@/shared/ui/Table';

const AdminPageWrapper = () => {
  return (
    <div className="space-y-[73px]">
      <AdminProfile />
      <div className="space-y-[26px]">
        <p className="text-h2 text-black">회원가입 요청</p>
        <div className="h-auto">
          <TableForm maxHeight="270px" footerType="default" />
        </div>
      </div>
      <div className="space-y-[26px]">
        <p className="text-h2 text-black">등록된 박람회</p>
        <div className="h-auto">
          <TableForm maxHeight="414px" footerType="default" />
        </div>
      </div>
    </div>
  );
};

export default AdminPageWrapper;
