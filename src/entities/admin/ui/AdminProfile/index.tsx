import Image from 'next/image';
import React from 'react';
import { Setting } from '@/shared/assets/icons';
import Profile from '@/shared/assets/png/Profile.png';

const ProfileInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-[30px]">
    <p className="w-fit text-body2 text-gray-500">{label}</p>
    <p className="w-fit text-body2 text-black">{value}</p>
  </div>
);

const AdminProfile = () => {
  return (
    <div className="mx-auto my-0 flex w-fit">
      <div className="flex items-center gap-[124px] mobile:flex-col mobile:gap-[30px]">
        <Image src={Profile} alt="관리자 프로필" />
        <div className="space-y-[32px]">
          <ProfileInfo label="이름" value="김진원" />
          <ProfileInfo label="아이디" value="jin1234" />
          <ProfileInfo label="이메일" value="jin12345@gmail.com" />
        </div>
      </div>
      <Setting />
    </div>
  );
};

export default AdminProfile;
