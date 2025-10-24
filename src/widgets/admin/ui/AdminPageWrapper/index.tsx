'use client';

import { AdminProfile } from '@/entities/admin';
import {
  expoListCategories,
  requestSignUpCategories,
  useAdminData,
  useCheckActions,
  useDeleteActions,
} from '@/features/admin';
import { withLoading } from '@/shared/hocs';
import { TableForm } from '@/shared/ui/Table';

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

  const expoList =
    expoListData?.map(({ coverImage: _coverImage, ...rest }) => rest) || [];
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
            <TableForm
              categories={requestSignUpCategories}
              data={requestSignUp}
              maxHeight="414px"
              footerType="check"
              text="요청"
              actions={checkSignupActions}
            />
          </div>

          <div className="space-y-[26px]">
            <p className="text-h2b text-black">등록된 박람회</p>
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
    ),
  });
};

export default AdminPageWrapper;
