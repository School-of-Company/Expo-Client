import React, { useState } from 'react';
import { Logout } from '@/shared/assets/icons';
import { useDeleteUserAccount } from '../../model/useDeleteUserAccount';
import { useLogout } from '../../model/useLogout';
import { AdminData } from '@/shared/types/admin/type';

const ProfileInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-16 overflow-hidden">
    <p className="w-64 flex-none text-h2r text-gray-500 mobile:w-50 mobile:text-body2r">
      {label}
    </p>
    <p className="min-w-0 flex-1 truncate text-h2r text-black mobile:text-body2r">
      {value}
    </p>
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
    <div className="relative flex w-full overflow-hidden mobile:flex-col">
      <div className="flex w-full">
        <div className="flex min-w-0 flex-1 items-center gap-[124px] mobile:flex-col mobile:gap-[30px]">
          <div className="w-full space-y-[32px]">
            <ProfileInfo label="이름" value={data.name} />
            <ProfileInfo label="아이디" value={data.nickname} />
            <ProfileInfo label="이메일" value={data.email} />
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogoutClick}
          className="self-start"
        >
          <Logout />
        </button>
      </div>
      {isToggleLogout && (
        <div className="absolute right-0 top-[30px] flex h-fit flex-col gap-2 rounded-[6px] border border-gray-200 bg-white p-8 shadow-[0px_4px_4px_0px_rgba(0,_0,_0,_0.25)]">
          <button
            type="button"
            onClick={() => logout()}
            disabled={isLogoutPending || isLogoutSuccess}
            className="text-body2 w-full rounded-[6px] px-16 py-8 text-gray-500 hover:bg-error hover:text-white"
          >
            로그아웃
          </button>
          <button
            type="button"
            onClick={() => deleteAccount()}
            disabled={isDeletePending || isDeleteSuccess}
            className="text-body2 w-full rounded-[6px] px-16 py-8 text-gray-500 hover:bg-error hover:text-white"
          >
            회원탈퇴
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
