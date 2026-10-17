'use client';

import { useRef } from 'react';
import { toast } from 'react-toastify';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { Button } from '@/shared/ui';
import { getHeaderTitleByUserType } from '../../model/getHeaderTitleByUserType';
import ExhibitionAccessQrContainer from '../ExhibitionAccessQrContainer';

/** 폼 유형 모달에서 고를 수 있던 조합과 같다. 연수자는 사전 등록만 있다 */
const ACCESS_QR_TARGETS: {
  userType: string;
  applicationType: ApplicationType;
}[] = [
  { userType: 'STANDARD', applicationType: 'PRE' },
  { userType: 'STANDARD', applicationType: 'FIELD' },
  { userType: 'TRAINEE', applicationType: 'PRE' },
];

interface AccessQrPanelProps {
  id: string;
  userType: string | null;
  applicationType: ApplicationType;
  onSelect: (userType: string, applicationType: ApplicationType) => void;
}

/** 현장 신청 폼으로 가는 QR. 참가자에게 보여 주는 화면이라 전체 화면으로 띄울 수 있다 */
const AccessQrPanel = ({
  id,
  userType,
  applicationType,
  onSelect,
}: AccessQrPanelProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

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
          {ACCESS_QR_TARGETS.map((target) => {
            const isSelected =
              target.userType === userType &&
              target.applicationType === applicationType;
            return (
              <button
                key={`${target.userType}-${target.applicationType}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() =>
                  onSelect(target.userType, target.applicationType)
                }
                className={`flex-1 rounded-sm border-1 border-solid px-16 py-14 text-left text-body2b ${
                  isSelected
                    ? 'border-main-600 bg-main-600 text-white'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {getHeaderTitleByUserType(
                  target.userType,
                  target.applicationType,
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-auto pt-8">
          <Button onClick={showFullscreen} disabled={!userType}>
            전체 화면으로 띄우기
          </Button>
        </div>
      </section>
      {userType ? (
        <div
          ref={qrRef}
          className="flex min-h-[600px] flex-1 flex-col rounded-sm border-1 border-solid border-gray-200 bg-white py-40 tablet:min-h-[440px]"
        >
          <ExhibitionAccessQrContainer
            id={id}
            userType={userType}
            applicationType={applicationType}
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
