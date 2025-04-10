'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp } from '@/shared/assets/icons';
import { Share } from '@/shared/assets/svg';
import { Button } from '@/shared/ui';

interface ExpoActionPanelProps {
  params: number;
  openModal: (type: string, content: string) => void;
}

const ExpoActionPanel = ({ params, openModal }: ExpoActionPanelProps) => {
  const router = useRouter();
  const [isMore, setIsMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
              <Button
                onClick={() => router.push(`/expo-manage/${params}`)}
                variant="white"
              >
                조회하기
              </Button>
              <Button
                variant="white"
                onClick={() =>
                  openModal('formcreate', '생성할 항목을 선택하세요.')
                }
              >
                폼 생성하기
              </Button>
            </div>
            <div className="space-y-8 tablet:flex tablet:gap-16 tablet:space-y-0">
              <Button variant="white">통계 확인하기</Button>
              <Button
                variant="white"
                onClick={() => router.push(`/name-tag/${params}`)}
              >
                QR 조회하기
              </Button>
            </div>
            <div
              style={{
                maxHeight: isMobile || isMore ? 'none' : '0px',
              }}
              className={`flex flex-col gap-8 overflow-hidden`}
            >
              <div className="space-y-8 tablet:flex tablet:gap-16 tablet:space-y-0">
                <Button
                  onClick={() =>
                    router.push(`/program/${params}?navigation=standard`)
                  }
                  variant="white"
                >
                  프로그램
                </Button>
                <Button
                  variant="white"
                  onClick={() => openModal('message', '대상을 선택하세요.')}
                >
                  문자 보내기
                </Button>
              </div>
              <Button
                variant="gray"
                onClick={() => openModal('edit', '수정할 항목을 선택하세요.')}
              >
                수정하기
              </Button>
            </div>
            {!isMobile && (
              <>
                {isMore ? (
                  <div
                    className="mt-[1rem] flex w-full cursor-pointer justify-center gap-[0.5rem] text-h3r text-main-600"
                    onClick={() => setIsMore(false)}
                  >
                    <span>접기</span>
                    <ArrowUp fill="#448FFF" />
                  </div>
                ) : (
                  <div
                    onClick={() => setIsMore(true)}
                    className="mt-[1rem] flex w-full cursor-pointer justify-center gap-[0.5rem] text-h3r text-gray-400"
                  >
                    <span>더보기</span>
                    <ArrowDown fill="#A7A7A7" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {!isMobile && (
          <button
            type="button"
            className="flex items-center gap-10"
            onClick={() => openModal('share', '공유할 항목을 선택하세요.')}
          >
            <Share />
            <p className="text-h3r text-gray-400">공유하기</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpoActionPanel;
