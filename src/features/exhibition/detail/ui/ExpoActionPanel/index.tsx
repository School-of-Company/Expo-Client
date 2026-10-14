'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { ExpoAction, getExpoActions } from '@/entities/exhibition';
import { ArrowDown, ArrowUp } from '@/shared/assets/icons';
import { Share } from '@/shared/assets/svg';
import { COLORS, getRegistrationRoutes } from '@/shared/config';
import { Button } from '@/shared/ui';

interface ExpoActionPanelProps {
  params: string;
  openModal: (type: string, content: string) => void;
}

const ExpoActionPanel = ({ params, openModal }: ExpoActionPanelProps) => {
  const router = useRouter();
  const [isMore, setIsMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const actions = getExpoActions(params);

  const renderAction = (
    action: ExpoAction,
    variant: 'white' | 'gray' = 'white',
  ) => (
    <Button
      variant={variant}
      onClick={() =>
        'href' in action
          ? router.push(action.href)
          : openModal(action.modal.type, action.modal.text)
      }
    >
      {action.title}
    </Button>
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center gap-24">
        <div className="h-fit w-full rounded-sm border-1 border-solid border-gray-200 p-[18px] tablet:w-full tablet:border-none tablet:px-0">
          <div className="w-full space-y-8">
            <div className="space-y-8 tablet:flex tablet:gap-16 tablet:space-y-0">
              {renderAction(actions.participants)}
              {renderAction(actions.formCreate)}
            </div>
            <div className="space-y-8 tablet:flex tablet:gap-16 tablet:space-y-0">
              {renderAction(actions.fieldQr)}
              {renderAction(actions.checkIn)}
            </div>
            <div
              style={{
                maxHeight: isMobile || isMore ? 'none' : '0px',
              }}
              className={`flex flex-col gap-8 overflow-hidden`}
            >
              <div className="space-y-8 tablet:flex tablet:gap-16 tablet:space-y-0">
                {renderAction(actions.program)}
                {renderAction(actions.message)}
              </div>
              {renderAction(actions.paperQr)}
              {renderAction(actions.lottery)}
              {renderAction(actions.edit, 'gray')}
            </div>
            {!isMobile && (
              <>
                {isMore ? (
                  <div
                    className="mt-[1rem] flex w-full cursor-pointer justify-center gap-[0.5rem] text-h3r text-main-600"
                    onClick={() => setIsMore(false)}
                  >
                    <span>접기</span>
                    <ArrowUp fill={COLORS.main600} />
                  </div>
                ) : (
                  <div
                    onClick={() => setIsMore(true)}
                    className="mt-[1rem] flex w-full cursor-pointer justify-center gap-[0.5rem] text-h3r text-gray-400"
                  >
                    <span>더보기</span>
                    <ArrowDown fill={COLORS.gray400} />
                  </div>
                )}
              </>
            )}
            <Button
              onClick={() =>
                router.push(getRegistrationRoutes(params).dashboard)
              }
            >
              사전등록 관리
            </Button>
          </div>
        </div>
        {!isMobile && (
          <button
            type="button"
            className="flex items-center gap-10"
            onClick={() => openModal('share', '공유할 항목을 선택하세요.')}
          >
            <Share />
            <p className="text-h3r text-gray-400">공유</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpoActionPanel;
