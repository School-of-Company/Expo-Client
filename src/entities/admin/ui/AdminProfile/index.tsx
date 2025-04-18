import React, { useState } from 'react';
import { Logout } from '@/shared/assets/icons';
import { AdminData } from '@/shared/types/admin/type';
import { useDeleteUserAccount } from '../../model/useDeleteUserAccount';
import { useLogout } from '../../model/useLogout';

const ProfileInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-[64px]">
    <p className="w-fit text-h2r text-gray-500 mobile:text-body2r">{label}</p>
    <p className="truncate text-h2r text-black mobile:text-body2r">{value}</p>
  </div>
);

const AdminProfile = ({ data }: { data: AdminData }) => {
  const {
    mutate: logout,
    isPending: isLogoutPending,
    isSuccess: isLogoutSuccess,
  } = useLogout();
  const {
    mutate: deleteAccount,
    isPending: isDeletePending,
    isSuccess: isDeleteSuccess,
  } = useDeleteUserAccount();

  const [isToggleLogout, setIsToggleLogout] = useState(false);

  const handleLogoutClick = () => {
    setIsToggleLogout((prev) => !prev);
  };

  return (
    <div className="relative flex w-full justify-between">
      <div className="flex items-center gap-[124px] mobile:flex-col mobile:gap-[30px]">
        <div className="space-y-[32px]">
          <ProfileInfo label="이름" value={data.name} />
          <ProfileInfo label="아이디" value={data.nickname} />
          <ProfileInfo label="이메일" value={data.email} />
        </div>
      </div>
      <div>
        <button onClick={handleLogoutClick}>
          <Logout />
        </button>
        {isToggleLogout && (
          <div className="absolute right-0 top-[30px] flex h-fit flex-col gap-2 rounded-[6px] border border-gray-200 bg-white p-8 shadow-[0px_4px_4px_0px_rgba(0,_0,_0,_0.25)]">
            <button
              onClick={() => logout()}
              disabled={isLogoutPending || isLogoutSuccess}
              className="text-body2 w-full rounded-[6px] px-16 py-8 text-gray-500 hover:bg-error hover:text-white"
            >
              로그아웃
            </button>
            <button
              onClick={() => deleteAccount()}
              disabled={isDeletePending || isDeleteSuccess}
              className="text-body2 w-full rounded-[6px] px-16 py-8 text-gray-500 hover:bg-error hover:text-white"
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
