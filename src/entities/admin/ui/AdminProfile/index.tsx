import React from 'react';
import { Logout } from '@/shared/assets/icons';

const ProfileInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-[30px]">
    <p className="w-fit text-body2 text-gray-500">{label}</p>
    <p className="w-fit text-body2 text-black">{value}</p>
  </div>
);

const AdminProfile = () => {
  return (
    <div className="flex w-full justify-between">
      <div className="flex items-center gap-[124px] mobile:flex-col mobile:gap-[30px]">
        <div className="space-y-[32px]">
          <ProfileInfo label="이름" value="김진원" />
          <ProfileInfo label="아이디" value="jin1234" />
          <ProfileInfo label="이메일" value="jin12345@gmail.com" />
        </div>
      </div>
      <label>
        <Logout />
      </label>
    </div>
  );
};

export default AdminProfile;
