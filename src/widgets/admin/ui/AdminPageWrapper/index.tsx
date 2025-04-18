'use client';

import { useMemo, useState } from 'react';
import { AdminProfile } from '@/entities/admin';
import withLoading from '@/shared/hocs/withLoading';
import SortFilter from '@/shared/ui/SortFilter';
import { TableForm } from '@/shared/ui/Table';
import {
  getFilteredExpoList,
  getSortedRequestSignUp,
} from '../../model/adminUtils';
import {
  expoListCategories,
  requestSignUpCategories,
} from '../../model/category';
import { filterOptions } from '../../model/filterOptions';
import { useAdminData } from '../../model/useAdminData';
import { useCheckActions } from '../../model/useCheckActions';
import { useDeleteActions } from '../../model/useDeleteActions';

const AdminPageWrapper = () => {
  const { expoListData, requestSignUpData, requestAdminData, isLoading } =
    useAdminData();
  const { approveSignup, rejectSignup } = useCheckActions();
  const { deleteExpo } = useDeleteActions();
  const [expoListFilter, setExpoListFilter] = useState(filterOptions[0]);
  const [signUpFilter, setSignUpFilter] = useState(filterOptions[0]);

  const checkSignupActions = {
    CheckBadge: approveSignup,
    DeleteBadge: rejectSignup,
  };

  const deleteExpoActions = {
    DeleteBadge: deleteExpo,
  };

  const expoList = expoListData.data || [];
  const requestSignUp = requestSignUpData.data || [];
  const requestAdmin = requestAdminData.data;

  const sortedRequestSignUp = useMemo(
    () => getSortedRequestSignUp(requestSignUp, signUpFilter.value),
    [requestSignUp, signUpFilter.value],
  );

  const filteredExpoList = useMemo(
    () => getFilteredExpoList(expoList, expoListFilter.value),
    [expoList, expoListFilter.value],
  );

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[80px] overflow-y-auto">
        {requestAdmin && <AdminProfile data={requestAdmin} />}
        <div className="space-y-36">
          <div className="space-y-[26px]">
            <div className="flex items-center justify-between">
              <p className="text-h2b text-black">회원가입 요청</p>
              <SortFilter
                options={filterOptions}
                selectedOption={signUpFilter}
                setSelectedOption={setSignUpFilter}
              />
            </div>
            <div className="h-auto">
              <TableForm
                categories={requestSignUpCategories}
                data={sortedRequestSignUp}
                maxHeight="270px"
                footerType="check"
                text="회원가입 요청"
                actions={checkSignupActions}
              />
            </div>
          </div>

          <div className="space-y-[26px]">
            <div className="flex items-center justify-between">
              <p className="text-h2b text-black">등록된 박람회</p>
              <SortFilter
                options={filterOptions}
                selectedOption={expoListFilter}
                setSelectedOption={setExpoListFilter}
              />
            </div>
            <div className="h-auto">
              <TableForm
                categories={expoListCategories}
                data={filteredExpoList}
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
