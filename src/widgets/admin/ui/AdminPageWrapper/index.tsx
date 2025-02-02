'use client';

import { AdminProfile } from '@/entities/admin';
import withLoading from '@/shared/hocs/withLoading';
import { checkActions, deleteActions } from '@/shared/model/footerActions';
import { TableForm } from '@/shared/ui/Table';
import {
  expoListCategories,
  requestSignUpCategories,
} from '../../model/category';
import { useAdminData } from '../../model/useAdminData';

const AdminPageWrapper = () => {
  const { expoListData, requestSignUpData, requestAdminData, isLoading } =
    useAdminData();

  const checkSignupActions = checkActions(async () => {
    await requestSignUpData.refetch();
  });
  const deleteExpoActions = deleteActions(async () => {
    await expoListData.refetch();
  });

  const expoList = expoListData.data || [];
  const requestSignUp = requestSignUpData.data || [];
  const requestAdmin = requestAdminData.data;

  return withLoading({
    isLoading,
    children: (
      <div className="space-y-[73px]">
        {requestAdmin && <AdminProfile data={requestAdmin} />}
        <div className="space-y-[26px]">
          <p className="text-h2 text-black">회원가입 요청</p>
          <div className="h-auto">
            <TableForm
              categories={requestSignUpCategories}
              data={requestSignUp}
              maxHeight="270px"
              footerType="check"
              text="회원가입 요청"
              actions={checkSignupActions}
            />
          </div>
        </div>
        <div className="space-y-[26px]">
          <p className="text-h2 text-black">등록된 박람회</p>
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
    ),
  });
};

export default AdminPageWrapper;
