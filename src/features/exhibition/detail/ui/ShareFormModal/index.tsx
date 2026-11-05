'use client';

import React from 'react';
import { toast } from 'react-toastify';
import { XMark } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

interface ShareTarget {
  label: string;
  formType: 'application' | 'survey';
  userType: 'STANDARD' | 'TRAINEE';
  applicationType: 'PRE' | 'FIELD';
}

// 참가자가 여는 신청·설문 화면의 조합이다
const SHARE_TARGETS: ShareTarget[] = [
  {
    label: '일반 사전등록',
    formType: 'application',
    userType: 'STANDARD',
    applicationType: 'PRE',
  },
  {
    label: '일반 현장등록',
    formType: 'application',
    userType: 'STANDARD',
    applicationType: 'FIELD',
  },
  {
    label: '연수자 사전등록',
    formType: 'application',
    userType: 'TRAINEE',
    applicationType: 'PRE',
  },
  {
    label: '참가자 만족도 조사',
    formType: 'survey',
    userType: 'STANDARD',
    applicationType: 'PRE',
  },
  {
    label: '연수자 만족도 조사',
    formType: 'survey',
    userType: 'TRAINEE',
    applicationType: 'PRE',
  },
];

const toShareUrl = (expoId: string, target: ShareTarget) => {
  const query = new URLSearchParams({
    formType: target.formType,
    userType: target.userType,
    applicationType: target.applicationType,
  });
  return `${window.location.origin}/application/${encodeURIComponent(expoId)}?${query}`;
};

export const SHARE_MODAL_TITLE = '공유할 폼을 선택하세요.';

/** 참가자에게 보낼 신청·설문 주소를 한 화면에서 골라 복사한다 */
const ShareFormModal = ({
  expoId,
  onClose,
}: {
  expoId: string;
  onClose: () => void;
}) => {
  const copy = (target: ShareTarget) => {
    navigator.clipboard
      .writeText(toShareUrl(expoId, target))
      .then(() => {
        toast.success(`${target.label} 주소가 복사되었습니다.`);
        onClose();
      })
      .catch(() => {
        toast.error('URL 복사에 실패했습니다. 다시 시도해주세요.');
      });
  };

  return (
    <div className="w-[656px] rounded-sm bg-white p-28 mobile:p-20">
      <div className="flex flex-col gap-40">
        <div className="flex w-full justify-between">
          <p className="text-h2b mobile:text-body1b">{SHARE_MODAL_TITLE}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-m-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center"
          >
            <XMark />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
          {SHARE_TARGETS.map((target) => (
            <Button
              key={target.label}
              variant="white"
              onClick={() => copy(target)}
            >
              {target.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShareFormModal;
