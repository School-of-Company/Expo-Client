'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';
import { useStandardProgram } from '@/shared/queries/useStandardProgram';
import { Button } from '@/shared/ui';
import ExhibitionAccessQrContainer from '../ExhibitionAccessQrContainer';

interface AccessQrTarget {
  key: string;
  label: string;
  path: string;
}

interface AccessQrPanelProps {
  id: string;
  /** 고른 QR 대상의 key. 주소의 `target` 값이다 */
  target: string | null;
  onSelect: (target: string) => void;
}

/**
 * 현장에 띄우는 신청 사이트 바로가기 QR. 참가자에게 보여 주는 화면이라 전체 화면으로 띄울 수 있다.
 * 현장등록은 신청 목록으로 보내 인증을 거쳐 등록하게 하고, 현장 정원이 있는 프로그램은 그 프로그램 신청으로 바로 보낸다.
 * 일반 사전등록 폼은 회차 없이 열면 거절되므로(400) 대상에 두지 않는다
 */
const AccessQrPanel = ({ id, target, onSelect }: AccessQrPanelProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const { data: programs, isError } = useStandardProgram(id);
  const targets: AccessQrTarget[] = [
    {
      key: 'field',
      label: '현장등록',
      path: `/application/forms/${id}?view=list`,
    },
    {
      key: 'trainee',
      label: '사전 연수자',
      path: `/application/${id}?formType=application&userType=TRAINEE&applicationType=PRE`,
    },
    ...(programs ?? [])
      .filter(({ policy }) => (policy?.onsiteCapacity ?? 0) > 0)
      .map((program) => ({
        key: `program-${program.id}`,
        label: program.title,
        path: `/application/forms/${id}/program?programId=${program.id}`,
      })),
  ];
  const selected = targets.find(({ key }) => key === target);

  const showFullscreen = () => {
    qrRef.current?.requestFullscreen().catch(() => {
      toast.error(
        '전체 화면으로 띄울 수 없습니다. 브라우저 설정을 확인해주세요.',
      );
    });
  };

  return (
    <div className="flex gap-24 tablet:flex-col">
      <section className="flex w-[320px] shrink-0 flex-col gap-16 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16 tablet:w-full">
        <p className="text-body1b text-black">QR 대상</p>
        <div
          role="radiogroup"
          aria-label="QR 대상"
          className="flex flex-col gap-8 mobile:flex-col tablet:flex-row"
        >
          {targets.map(({ key, label }) => {
            const isSelected = key === selected?.key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelect(key)}
                className={`flex-1 rounded-sm border-1 border-solid px-16 py-14 text-left text-body2b ${
                  isSelected
                    ? 'border-main-600 bg-main-600 text-white'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {key.startsWith('program-') ? `${label} 바로가기` : label}
              </button>
            );
          })}
        </div>
        {isError && (
          <p className="break-keep text-caption1r text-error">
            프로그램을 불러오지 못해 프로그램 바로가기 QR을 표시할 수 없습니다.
          </p>
        )}
        <div className="mt-auto pt-8">
          <Button onClick={showFullscreen} disabled={!selected}>
            전체 화면으로 띄우기
          </Button>
        </div>
      </section>
      {selected ? (
        <div
          ref={qrRef}
          className="flex min-h-[600px] flex-1 flex-col rounded-sm border-1 border-solid border-gray-200 bg-white py-40 tablet:min-h-[440px]"
        >
          <ExhibitionAccessQrContainer
            path={selected.path}
            label={selected.label}
          />
        </div>
      ) : (
        <div className="flex min-h-[600px] flex-1 items-center justify-center rounded-sm bg-gray-100 tablet:min-h-[300px]">
          <p className="text-body1b text-gray-400">QR 대상을 골라 주세요</p>
        </div>
      )}
    </div>
  );
};

export default AccessQrPanel;
