'use client';

import { FormEvent, useState } from 'react';
import {
  EXPO_MEMBER_ROLE_DESCRIPTION,
  EXPO_MEMBER_ROLE_LABEL,
  EXPO_MEMBER_ROLES,
} from '@/shared/config';
import { ExpoMemberRole } from '@/shared/types/exhibition/member/type';
import { Button, QueryError } from '@/shared/ui';
import {
  useExpoMemberMutations,
  useExpoMembers,
} from '../../model/useExpoMembers';

const selectClass =
  'rounded-sm border-1 border-solid border-gray-200 px-12 py-10 text-body2r text-black disabled:text-gray-400';

const RoleSelect = ({
  value,
  onChange,
  disabled,
  label,
}: {
  value: ExpoMemberRole;
  onChange: (role: ExpoMemberRole) => void;
  disabled?: boolean;
  label: string;
}) => (
  <select
    aria-label={label}
    value={value}
    disabled={disabled}
    onChange={(event) => onChange(event.target.value as ExpoMemberRole)}
    className={selectClass}
  >
    {EXPO_MEMBER_ROLES.map((role) => (
      <option key={role} value={role}>
        {EXPO_MEMBER_ROLE_LABEL[role]}
      </option>
    ))}
  </select>
);

/** 운영진 목록·추가·역할 변경·내보내기. 서버는 관리자 ID 와 역할만 주고 받는다 */
const ExpoMemberSection = ({ expoId }: { expoId: string }) => {
  const members = useExpoMembers(expoId);
  const { add, changeRole, remove } = useExpoMemberMutations(expoId);
  const [adminId, setAdminId] = useState('');
  const [role, setRole] = useState<ExpoMemberRole>('MANAGER');

  const parsedAdminId = Number(adminId);
  const isValidAdminId =
    /^\d+$/.test(adminId) &&
    Number.isSafeInteger(parsedAdminId) &&
    parsedAdminId > 0;

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    if (!isValidAdminId || add.isPending) return;
    add.mutate(
      { adminId: parsedAdminId, role },
      { onSuccess: () => setAdminId('') },
    );
  };

  const handleRoleChange = (memberId: number, next: ExpoMemberRole) => {
    if (
      window.confirm(
        `관리자 ${memberId}의 역할을 ${EXPO_MEMBER_ROLE_LABEL[next]}(으)로 바꿀까요?`,
      )
    ) {
      changeRole.mutate({ adminId: memberId, role: next });
    }
  };

  const handleRemove = (memberId: number) => {
    if (
      window.confirm(
        `관리자 ${memberId}을(를) 운영진에서 내보낼까요?\n이 박람회가 그 관리자의 목록에서 사라집니다.`,
      )
    ) {
      remove.mutate(memberId);
    }
  };

  const isBusy = changeRole.isPending || remove.isPending;

  return (
    <section className="flex flex-col gap-20">
      <div className="space-y-6">
        <h2 className="text-h3b text-black">운영진</h2>
        <ul className="space-y-2 text-caption1r text-gray-500">
          {EXPO_MEMBER_ROLES.map((value) => (
            <li key={value}>
              {EXPO_MEMBER_ROLE_LABEL[value]}:{' '}
              {EXPO_MEMBER_ROLE_DESCRIPTION[value]}
            </li>
          ))}
          <li>
            소유자는 최대 3명이며, 마지막 소유자는 내보내거나 바꿀 수 없습니다.
          </li>
        </ul>
      </div>

      {members.isError ? (
        <QueryError
          message={members.error.message}
          onRetry={() => members.refetch()}
        />
      ) : members.isLoading ? (
        <p role="status" className="text-body2r text-gray-500">
          운영진을 불러오는 중...
        </p>
      ) : (
        <ul className="divide-y-1 divide-solid divide-gray-100 rounded-sm border-1 border-solid border-gray-200">
          {(members.data ?? []).map((member) => (
            <li
              key={member.adminId}
              className="flex flex-wrap items-center justify-between gap-12 px-16 py-12"
            >
              <p className="text-body2b text-black">관리자 {member.adminId}</p>
              <div className="flex items-center gap-8">
                <RoleSelect
                  label={`관리자 ${member.adminId} 역할`}
                  value={member.role}
                  disabled={isBusy}
                  onChange={(next) => handleRoleChange(member.adminId, next)}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(member.adminId)}
                  disabled={isBusy}
                  className="text-body2r text-error underline disabled:text-gray-300"
                >
                  내보내기
                </button>
              </div>
            </li>
          ))}
          {members.data?.length === 0 && (
            <li className="px-16 py-12 text-body2r text-gray-500">
              등록된 운영진이 없습니다.
            </li>
          )}
        </ul>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-12 rounded-sm bg-gray-100 p-16"
      >
        <p className="text-body2b text-black">운영진 초대</p>
        <p className="break-keep text-caption1r text-gray-500">
          가입 승인이 끝난 관리자의 ID(숫자)를 넣습니다. 이름으로 찾는 기능은
          아직 없어 ID는 최고 관리자에게 확인해 주세요.
        </p>
        <div className="flex flex-wrap items-center gap-8">
          <input
            inputMode="numeric"
            aria-label="관리자 ID"
            placeholder="관리자 ID"
            value={adminId}
            onChange={(event) => setAdminId(event.target.value.trim())}
            className="min-w-0 flex-1 rounded-sm border-1 border-solid border-gray-200 bg-white px-12 py-10 text-body2r"
          />
          <RoleSelect label="초대할 역할" value={role} onChange={setRole} />
          <div className="w-[120px]">
            <Button type="submit" disabled={!isValidAdminId || add.isPending}>
              {add.isPending ? '추가 중...' : '추가'}
            </Button>
          </div>
        </div>
        {adminId && !isValidAdminId && (
          <p role="alert" className="text-caption1r text-error">
            관리자 ID는 1 이상의 숫자입니다.
          </p>
        )}
      </form>
    </section>
  );
};

export default ExpoMemberSection;
