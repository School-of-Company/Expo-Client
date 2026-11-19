'use client';

import { useState } from 'react';
import { Button, ToggleButton } from '@/shared/ui';

interface PhoneVerificationRowProps {
  /** 초안을 반영한 값 */
  value: boolean;
  isPending: boolean;
  disabled: boolean;
  onChange: (required: boolean) => void;
}

/**
 * 참가자 휴대전화 본인 인증. 기능 행이 아니라 기존 인증 설정이며(서버 authentication), 기능과 함께 한 번에 저장한다.
 * 끄면 누구나 인증 없이 신청할 수 있으므로 초안에 넣기 전에 한 번 더 확인한다
 */
const PhoneVerificationRow = ({
  value,
  isPending,
  disabled,
  onChange,
}: PhoneVerificationRowProps) => {
  const [isConfirmingOff, setIsConfirmingOff] = useState(false);

  return (
    <section
      aria-labelledby="participant-phone-verification-title"
      className="flex flex-col gap-12 rounded-sm border-1 border-solid border-gray-200 bg-white px-[20px] py-[16px]"
    >
      <div className="flex items-start justify-between gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-8">
            <h2
              id="participant-phone-verification-title"
              className="text-body1b text-black"
            >
              참가자 휴대전화 본인 인증
            </h2>
            {isPending && (
              <span className="rounded-sm border-1 border-solid border-gray-300 px-8 py-2 text-caption1r text-gray-700">
                저장 전
              </span>
            )}
          </div>
          <p
            id="participant-phone-verification-desc"
            className="break-keep text-caption1r text-gray-500"
          >
            켜면 일반 참가자가 사전등록·현장등록 전에 휴대전화 인증을
            거칩니다(기본). 끄면 두 등록은 인증 없이 받습니다. 내 신청
            확인·프로그램 신청은 설정과 관계없이 인증이 필요합니다. 인증번호
            문자는 자동 알림·단체 메시지 설정과 관계없이 보냅니다.
          </p>
        </div>
        <ToggleButton
          label="참가자 휴대전화 본인 인증 필요"
          value={value}
          disabled={disabled}
          describedBy="participant-phone-verification-desc"
          onChange={(next) => {
            if (next) {
              setIsConfirmingOff(false);
              onChange(true);
            } else {
              setIsConfirmingOff(true);
            }
          }}
        />
      </div>

      {isConfirmingOff && (
        <div
          role="alert"
          className="flex flex-col gap-8 rounded-sm border-1 border-solid border-error px-[16px] py-[12px]"
        >
          <p className="break-keep text-body2r text-gray-600">
            인증을 끄면 휴대전화 인증 없이 누구나 신청할 수 있어 다른 사람의
            번호로 신청할 수 있습니다. 끌까요? 저장해야 적용됩니다.
          </p>
          <div className="flex gap-8">
            <Button variant="white" onClick={() => setIsConfirmingOff(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                setIsConfirmingOff(false);
                onChange(false);
              }}
            >
              인증 끄기
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default PhoneVerificationRow;
