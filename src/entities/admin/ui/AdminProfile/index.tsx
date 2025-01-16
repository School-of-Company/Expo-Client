import React, { useState } from 'react';
import { Logout } from '@/shared/assets/icons';
import { useDeleteUserAccount } from '../../model/useDeleteUserAccount';
import { useLogout } from '../../model/useLogout';

const ProfileInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-[30px]">
    <p className="w-fit text-body2 text-gray-500">{label}</p>
    <p className="w-fit text-body2 text-black">{value}</p>
  </div>
);

const AdminProfile = () => {
  const { mutate: logout } = useLogout();
  const { mutate: deleteAccount } = useDeleteUserAccount();
  const [isToggleLogout, setIsToggleLogout] = useState(false);

  const handleLogoutClick = () => {
    setIsToggleLogout((prev) => !prev);
  };

  return (
    <div className="relative flex w-full justify-between">
      <div className="flex items-center gap-[124px] mobile:flex-col mobile:gap-[30px]">
        <div className="space-y-[32px]">
          <ProfileInfo label="이름" value="김진원" />
          <ProfileInfo label="아이디" value="jin1234" />
          <ProfileInfo label="이메일" value="jin12345@gmail.com" />
        </div>
      </div>
      <div>
        <button onClick={handleLogoutClick}>
          <Logout />
        </button>
        {isToggleLogout && (
          <div className="absolute right-0 top-[30px] flex h-fit flex-col gap-2 rounded-[6px] border border-gray-200 bg-white p-2 shadow-[0px_4px_4px_0px_rgba(0,_0,_0,_0.25)]">
            <button
              onClick={() => logout()}
              className="w-full rounded-[6px] px-5 py-2 text-body2 text-gray-500 hover:bg-error hover:text-white"
            >
              로그아웃
            </button>
            <button
              onClick={() => deleteAccount()}
              className="w-full rounded-[6px] px-5 py-2 text-body2 text-gray-500 hover:bg-error hover:text-white"
            >
              회원탈퇴
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
