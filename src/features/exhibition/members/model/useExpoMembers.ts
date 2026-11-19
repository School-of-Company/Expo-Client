import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ExpoMemberRole } from '@/shared/types/exhibition/member/type';
import {
  deleteExpoMember,
  deleteStaffInvite,
  getExpoMembers,
  getStaffInvites,
  patchExpoMember,
  postExpoMember,
  postStaffInvite,
} from '../api/expoMembersApi';

const membersKey = (expoId: string) => ['expoMembers', expoId] as const;
const invitesKey = (expoId: string) => ['expoStaffInvites', expoId] as const;

const showError = (error: Error) => toast.error(error.message);

export const useExpoMembers = (expoId: string) =>
  useQuery({
    queryKey: membersKey(expoId),
    queryFn: () => getExpoMembers(expoId),
    meta: { silent: true },
    retry: false,
  });

/** 추가·역할 변경·내보내기. 성공하면 목록과 내 역할(박람회 목록의 myRole)을 다시 읽는다 */
export const useExpoMemberMutations = (expoId: string) => {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: membersKey(expoId) });
    queryClient.invalidateQueries({ queryKey: ['expoValid'] });
  };

  const add = useMutation({
    mutationFn: (body: { adminId: number; role: ExpoMemberRole }) =>
      postExpoMember(expoId, body),
    onSuccess: () => {
      toast.success('운영진을 추가했습니다.');
      refresh();
    },
    onError: showError,
  });
  const changeRole = useMutation({
    mutationFn: ({
      adminId,
      role,
    }: {
      adminId: number;
      role: ExpoMemberRole;
    }) => patchExpoMember(expoId, adminId, role),
    onSuccess: () => {
      toast.success('역할을 바꿨습니다.');
      refresh();
    },
    onError: (error: Error) => {
      showError(error);
      // 화면의 선택값을 서버 값으로 되돌린다
      refresh();
    },
  });
  const remove = useMutation({
    mutationFn: (adminId: number) => deleteExpoMember(expoId, adminId),
    onSuccess: () => {
      toast.success('운영진에서 내보냈습니다.');
      refresh();
    },
    onError: showError,
  });

  return { add, changeRole, remove };
};

export const useStaffInvites = (expoId: string) =>
  useQuery({
    queryKey: invitesKey(expoId),
    queryFn: () => getStaffInvites(expoId),
    meta: { silent: true },
    retry: false,
  });

export const useStaffInviteMutations = (expoId: string) => {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: invitesKey(expoId) });

  const create = useMutation({
    mutationFn: (body: { label: string; expiresAt: string }) =>
      postStaffInvite(expoId, body),
    onSuccess: refresh,
    onError: showError,
  });
  const revoke = useMutation({
    mutationFn: (inviteId: string) => deleteStaffInvite(expoId, inviteId),
    onSuccess: () => {
      toast.success(
        '스태프 링크를 회수했습니다. 이 링크로 연 화면은 곧 막힙니다.',
      );
      refresh();
    },
    onError: showError,
  });

  return { create, revoke };
};
