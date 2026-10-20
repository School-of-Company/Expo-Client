'use client';

import { useState } from 'react';
import { useExpoDetail } from '@/shared/queries';
import { Button, ToggleButton } from '@/shared/ui';
import { useParticipantPhoneVerificationMutation } from '../../model/useParticipantPhoneVerificationMutation';

/**
 * 박람회별 참가자 휴대전화 본인 인증 설정. 저장은 폼과 따로 바로 한다.
 * 서버가 관리자 상세 응답에 현재 값을 넣기 전에는 값을 알 수 없어, 모를 때는 저장한 뒤에야 값을 보인다.
 * 끄면 누구나 인증 없이 신청할 수 있으므로 한 번 더 확인한다
 */
const ParticipantPhoneVerificationSetting = ({ id }: { id: string }) => {
  const { data: expo } = useExpoDetail(id);
  const { mutate, isPending } = useParticipantPhoneVerificationMutation(id);
  const [isConfirmingOff, setIsConfirmingOff] = useState(false);

  const required = expo?.participantPhoneVerificationRequired;
  const isKnown = required !== undefined;

  const save = (next: boolean) => {
    setIsConfirmingOff(false);
    mutate(next);
  };

  return (
    <section
      aria-labelledby="participant-phone-verification-title"
      className="flex w-full max-w-[816px] flex-col gap-12 rounded-sm border-1 border-solid border-gray-200 bg-white px-[20px] py-[16px]"
    >
      <div className="flex items-center justify-between gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <h2
            id="participant-phone-verification-title"
            className="text-body1b text-black"
          >
            참가자 휴대전화 본인 인증
          </h2>
          <p className="break-keep text-caption1r text-gray-500">
            켜면 참가자가 신청하기 전에 휴대전화 인증을 거칩니다(기본). 끄면
            인증 없이 신청을 받습니다.
          </p>
        </div>
        {isKnown && (
          <ToggleButton
            label="참가자 휴대전화 본인 인증 필요"
            value={required}
            disabled={isPending}
            onChange={(next) => (next ? save(true) : setIsConfirmingOff(true))}
          />
        )}
      </div>

      {!isKnown && (
        <div className="flex flex-col gap-8">
          <p className="break-keep text-caption1r text-gray-500">
            현재 설정을 불러오지 못했습니다(서버 응답에 값이 없습니다). 아래
            버튼으로 설정하면 그 값이 저장됩니다.
          </p>
          <div className="flex gap-8 mobile:flex-col">
            <Button
              variant="white"
              disabled={isPending}
              onClick={() => save(true)}
            >
              인증 필요로 설정
            </Button>
            <Button
              variant="white"
              disabled={isPending}
              onClick={() => setIsConfirmingOff(true)}
            >
              인증 없이 설정
            </Button>
          </div>
        </div>
      )}

      {isConfirmingOff && (
        <div
          role="alert"
          className="flex flex-col gap-8 rounded-sm border-1 border-solid border-error px-[16px] py-[12px]"
        >
          <p className="break-keep text-body2r text-gray-600">
            인증을 끄면 휴대전화 인증 없이 누구나 신청할 수 있어 다른 사람의
            번호로 신청할 수 있습니다. 끌까요?
          </p>
          <div className="flex gap-8">
            <Button
              variant="white"
              disabled={isPending}
              onClick={() => setIsConfirmingOff(false)}
            >
              취소
            </Button>
            <Button disabled={isPending} onClick={() => save(false)}>
              인증 끄기
            </Button>
          </div>
        </div>
      )}

      <p className="break-keep text-caption1r text-gray-400">
        ※ 참가자 신청 화면의 인증 안내는 아직 이 설정을 따르지 않고 항상 인증
        화면으로 보냅니다.
      </p>
    </section>
  );
};

export default ParticipantPhoneVerificationSetting;
