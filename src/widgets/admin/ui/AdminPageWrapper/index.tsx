'use client';

import { AdminProfile } from '@/entities/admin';
import withLoading from '@/shared/hocs/withLoading';
import { TableForm } from '@/shared/ui/Table';
import {
  expoListCategories,
  requestSignUpCategories,
} from '../../model/category';
import { useAdminData } from '../../model/useAdminData';
import { useCheckActions } from '../../model/useCheckActions';
import { useDeleteActions } from '../../model/useDeleteActions';

const AdminPageWrapper = () => {
  const { expoListData, requestSignUpData, requestAdminData, isLoading } =
    useAdminData();
  const { approveSignup, rejectSignup } = useCheckActions();
  const { deleteExpo } = useDeleteActions();

  const checkSignupActions = {
    CheckBadge: approveSignup,
    DeleteBadge: rejectSignup,
  };

  const deleteExpoActions = {
    DeleteBadge: deleteExpo,
  };

  const expoList = expoListData || [];
  const requestSignUp = requestSignUpData?.data || [];
  const requestAdmin = requestAdminData?.data;

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[80px] overflow-y-auto">
        {requestAdmin && <AdminProfile data={requestAdmin} />}
        <div className="space-y-36">
          <div className="space-y-[26px]">
            <p className="text-h2b text-black">회원가입 요청</p>
            <div className="h-auto">
              <TableForm
                categories={requestSignUpCategories}
                data={requestSignUp}
                maxHeight="414px"
                footerType="check"
                text="요청"
                actions={checkSignupActions}
              />
            </div>
          </div>

          <div className="space-y-[26px]">
            <p className="text-h2b text-black">등록된 박람회</p>
            <div className="h-auto">
              <TableForm
                categories={expoListCategories}
                data={expoList}
                maxHeight="414px"
                footerType="delete"
                text="등록된 박람회"
                actions={deleteExpoActions}
              />
            </div>
          </div>
        </div>
      </div>
    ),
  });
};

export default AdminPageWrapper;
