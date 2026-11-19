'use client';

import { useRouter } from 'next/navigation';
import { useExpoPermission } from '@/features/exhibition/detail';
import {
  ExpoMemberSection,
  StaffInviteSection,
} from '@/features/exhibition/members';
import { EXPO_FORBIDDEN_MESSAGE } from '@/shared/libs/http/apiError';
import { DetailHeader } from '@/shared/ui';
import { Header } from '@/widgets/layout';

/** 운영진 초대·역할 변경과 스태프 링크 발급·회수(OWNER·최고 관리자 전용). 실제 차단은 서버가 한다 */
const ExhibitionMembersPage = ({ id }: { id: string }) => {
  const router = useRouter();
  const { myRole, canManageMembers } = useExpoPermission(id);
  // 역할을 아는데 소유자가 아니면 요청을 보내지 않고 안내만 한다. 모르면 서버 판정에 맡긴다
  const isForbidden = myRole !== null && !canManageMembers;

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 flex-col items-center gap-30 p-16">
        <div className="w-full max-w-[800px]">
          <DetailHeader
            className="gap-12"
            headerTitle="운영진"
            onBack={() =>
              router.push(`/admin/exhibition/detail/${encodeURIComponent(id)}`)
            }
          />
        </div>
        {isForbidden ? (
          <p
            role="alert"
            className="break-keep py-40 text-center text-body2r text-gray-500"
          >
            {EXPO_FORBIDDEN_MESSAGE} 운영진과 스태프 링크는 소유자만 관리합니다.
          </p>
        ) : (
          <div className="flex w-full max-w-[800px] flex-col gap-48">
            <ExpoMemberSection expoId={id} />
            <StaffInviteSection expoId={id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitionMembersPage;
