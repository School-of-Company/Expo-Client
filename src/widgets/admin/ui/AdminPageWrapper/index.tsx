'use client';

import { toast } from 'react-toastify';
import { AdminProfile } from '@/entities/admin';
import {
  expoListCategories,
  requestSignUpCategories,
  useAdminData,
  useCheckActions,
  useDeleteActions,
} from '@/features/admin';
import { canDeleteExpo } from '@/shared/config';
import { withLoading } from '@/shared/hocs';
import { EXPO_FORBIDDEN_MESSAGE } from '@/shared/libs/http/apiError';
import { TableForm } from '@/shared/ui/Table';

const AdminPageWrapper = () => {
  const {
    expoListData,
    page,
    requestSignUpData,
    requestAdminData,
    canApproveSignUp,
    superAdmin,
    isLoading,
  } = useAdminData();
  const { approveSignup, rejectSignup } = useCheckActions();
  const { deleteExpo } = useDeleteActions();

  const checkSignupActions = {
    CheckBadge: approveSignup,
    DeleteBadge: rejectSignup,
  };

  const expos = expoListData?.content ?? [];
  // 표는 객체의 값을 모두 칸으로 그려서 표에 없는 값은 뺀다
  const expoList = expos.map(
    ({ coverImage: _coverImage, myRole: _myRole, ...rest }) => rest,
  );

  // 박람회 삭제는 OWNER 만 한다. 지울 수 있는 박람회가 하나도 없으면 삭제 버튼을 두지 않는다
  const isDeletable = (id: string) =>
    superAdmin || canDeleteExpo(expos.find((expo) => expo.id === id)?.myRole);
  const hasDeletableExpo =
    superAdmin || expos.some(({ id }) => isDeletable(id));

  // 박람회 삭제는 되돌릴 수 없어 한 번 더 확인한다
  const deleteExpoActions = {
    DeleteBadge: (id: string) => {
      if (!isDeletable(id)) {
        toast.error(
          `${EXPO_FORBIDDEN_MESSAGE} 삭제는 소유자만 할 수 있습니다.`,
        );
        return;
      }
      const title = expoList.find((expo) => expo.id === id)?.title;
      const target = title ? `'${title}' 박람회` : '선택한 박람회';
      if (
        window.confirm(`${target}를 삭제할까요?\n삭제하면 되돌릴 수 없습니다.`)
      ) {
        deleteExpo(id);
      }
    },
  };
  const requestSignUp = requestSignUpData?.data || [];
  const requestAdmin = requestAdminData?.data;

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[80px] overflow-y-auto">
        {requestAdmin && <AdminProfile data={requestAdmin} />}
        <div className="space-y-36">
          {canApproveSignUp && (
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
          )}

          <div className="space-y-[26px]">
            <p className="text-h2b text-black">등록된 박람회</p>
            <TableForm
              key={page}
              id="expo-list"
              totalPage={expoListData?.totalPages}
              totalCount={expoListData?.totalElements}
              categories={expoListCategories}
              data={expoList}
              maxHeight="414px"
              footerType={hasDeletableExpo ? 'delete' : 'default'}
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
