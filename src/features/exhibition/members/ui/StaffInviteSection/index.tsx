'use client';

import { QRCodeSVG } from 'qrcode.react';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { getStaffLink } from '@/shared/config';
import { formatKstDateTime } from '@/shared/libs/kstDateTime';
import { Button, KstDateTimeInput, QueryError } from '@/shared/ui';
import {
  STAFF_INVITE_STATUS_LABEL,
  toStaffInviteStatus,
} from '../../model/staffInviteStatus';
import {
  useStaffInviteMutations,
  useStaffInvites,
} from '../../model/useExpoMembers';

const LABEL_MAX_LENGTH = 100;

// 기본 만료는 오늘 23:59(한국 시각). 이미 지났으면 지금부터 12시간
const defaultExpiresAt = () => {
  const now = Date.now();
  const kstToday = new Date(now + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const endOfDay = new Date(`${kstToday}T23:59:00+09:00`);
  return endOfDay.getTime() - now > 60 * 60 * 1000
    ? endOfDay
    : new Date(now + 12 * 60 * 60 * 1000);
};

/** 방금 만든 링크. 비밀값은 서버가 이때 한 번만 주므로 화면을 떠나면 다시 볼 수 없다 */
const CreatedLink = ({
  link,
  label,
  onClose,
}: {
  link: string;
  label: string;
  onClose: () => void;
}) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('링크를 복사했습니다.');
    } catch {
      toast.error('복사하지 못했습니다. 링크를 길게 눌러 직접 복사해 주세요.');
    }
  };

  return (
    <div
      role="status"
      className="flex flex-col items-center gap-12 rounded-sm border-2 border-solid border-main-600 p-16 text-center"
    >
      <p className="text-body1b text-black">{label} 링크를 만들었습니다</p>
      <p className="break-keep text-caption1r text-error">
        이 링크와 QR은 지금만 볼 수 있습니다. 스태프 폰으로 찍거나 복사해 전달한
        뒤 닫아 주세요. 링크를 가진 사람은 누구나 입장 처리를 할 수 있습니다.
      </p>
      <QRCodeSVG value={link} className="h-[220px] w-[220px]" />
      <p className="w-full break-all rounded-sm bg-gray-100 px-12 py-8 text-caption1r text-gray-700">
        {link}
      </p>
      <div className="flex w-full gap-8">
        <Button variant="white" onClick={copy}>
          링크 복사
        </Button>
        <Button variant="gray" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
};

/** 스태프 링크 발급·회수. 링크로 연 화면은 입장·퇴장·간편입장·프로그램 출석만 한다 */
const StaffInviteSection = ({ expoId }: { expoId: string }) => {
  const invites = useStaffInvites(expoId);
  const { create, revoke } = useStaffInviteMutations(expoId);
  const [label, setLabel] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(defaultExpiresAt);
  const [created, setCreated] = useState<{
    link: string;
    label: string;
  } | null>(null);

  const trimmed = label.trim();
  const isFuture = expiresAt !== null && expiresAt.getTime() > Date.now();
  const canSubmit =
    trimmed.length > 0 &&
    trimmed.length <= LABEL_MAX_LENGTH &&
    isFuture &&
    !create.isPending;

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !expiresAt) return;
    create.mutate(
      { label: trimmed, expiresAt: expiresAt.toISOString() },
      {
        onSuccess: (invite) => {
          if (!invite.secret) {
            toast.error('링크 비밀값을 받지 못했습니다. 다시 만들어 주세요.');
            return;
          }
          setCreated({
            link: getStaffLink(window.location.origin, invite.secret),
            label: invite.label,
          });
          setLabel('');
        },
      },
    );
  };

  const handleRevoke = (inviteId: string, inviteLabel: string) => {
    if (
      window.confirm(
        `'${inviteLabel}' 스태프 링크를 회수할까요?\n이 링크로 연 화면은 곧 입장 처리를 못 하게 됩니다.`,
      )
    ) {
      revoke.mutate(inviteId);
    }
  };

  const now = Date.now();
  const sorted = [...(invites.data ?? [])].sort((a, b) =>
    b.expiresAt.localeCompare(a.expiresAt),
  );

  return (
    <section className="flex flex-col gap-20">
      <div className="space-y-6">
        <h2 className="text-h3b text-black">스태프 링크</h2>
        <p className="break-keep text-caption1r text-gray-500">
          로그인 없이 현장 스태프가 폰으로 입장·퇴장·간편입장·프로그램 출석만 할
          수 있는 링크입니다. 명단 조회나 설정은 할 수 없습니다. 입구·강의실마다
          따로 만들어 두면 필요할 때 하나만 회수할 수 있습니다.
        </p>
      </div>

      {created && (
        <CreatedLink
          link={created.link}
          label={created.label}
          onClose={() => setCreated(null)}
        />
      )}

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-12 rounded-sm bg-gray-100 p-16"
      >
        <p className="text-body2b text-black">새 링크 만들기</p>
        <label className="flex flex-col gap-6">
          <span className="text-caption1r text-gray-600">
            이름 (예: 정문 입구, 2층 강의실)
          </span>
          <input
            value={label}
            maxLength={LABEL_MAX_LENGTH}
            onChange={(event) => setLabel(event.target.value)}
            className="rounded-sm border-1 border-solid border-gray-200 bg-white px-12 py-10 text-body2r"
          />
        </label>
        <div className="flex flex-col gap-6">
          <span className="text-caption1r text-gray-600">
            만료 시각 (한국 시각)
          </span>
          <KstDateTimeInput
            label="스태프 링크 만료 시각"
            value={expiresAt}
            onChange={setExpiresAt}
          />
          {expiresAt && !isFuture && (
            <p role="alert" className="text-caption1r text-error">
              만료 시각은 지금보다 뒤여야 합니다.
            </p>
          )}
        </div>
        <Button type="submit" disabled={!canSubmit}>
          {create.isPending ? '만드는 중...' : '링크 만들기'}
        </Button>
      </form>

      {invites.isError ? (
        <QueryError
          message={invites.error.message}
          onRetry={() => invites.refetch()}
        />
      ) : invites.isLoading ? (
        <p role="status" className="text-body2r text-gray-500">
          스태프 링크를 불러오는 중...
        </p>
      ) : (
        <ul className="divide-y-1 divide-solid divide-gray-100 rounded-sm border-1 border-solid border-gray-200">
          {sorted.map((invite) => {
            const status = toStaffInviteStatus(invite, now);
            return (
              <li
                key={invite.inviteId}
                className="flex flex-wrap items-center justify-between gap-12 px-16 py-12"
              >
                <div className="min-w-0 space-y-2">
                  <p className="truncate text-body2b text-black">
                    {invite.label}
                  </p>
                  <p className="text-caption1r text-gray-500">
                    {STAFF_INVITE_STATUS_LABEL[status]} ·{' '}
                    {status === 'REVOKED'
                      ? `${formatKstDateTime(invite.revokedAt)} 회수`
                      : `${formatKstDateTime(invite.expiresAt)} 만료`}
                  </p>
                </div>
                {status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(invite.inviteId, invite.label)}
                    disabled={revoke.isPending}
                    className="text-body2r text-error underline disabled:text-gray-300"
                  >
                    회수
                  </button>
                )}
              </li>
            );
          })}
          {sorted.length === 0 && (
            <li className="px-16 py-12 text-body2r text-gray-500">
              만든 스태프 링크가 없습니다.
            </li>
          )}
        </ul>
      )}
    </section>
  );
};

export default StaffInviteSection;
