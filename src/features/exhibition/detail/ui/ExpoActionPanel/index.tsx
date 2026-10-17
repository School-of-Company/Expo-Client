'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { ExpoAction, getExpoActions } from '@/entities/exhibition';
import { Share } from '@/shared/assets/svg';
import { getRegistrationRoutes } from '@/shared/config';
import { Button } from '@/shared/ui';

interface ExpoActionPanelProps {
  params: string;
  openModal: (type: string, content: string) => void;
}

const ExpoActionPanel = ({ params, openModal }: ExpoActionPanelProps) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const actions = getExpoActions(params);
  const registrationRoutes = getRegistrationRoutes(params);

  // 박람회 운영 페이지는 getExpoActions 전체를 카드로 보여 주고, 패널은 자주 쓰는 메뉴만 간추려 보여 준다
  const panelActions: ExpoAction[] = [
    { ...actions.edit, title: '박람회 수정' },
    actions.formCreate,
    { ...actions.fieldQr, title: 'QR' },
    { ...actions.participants, title: '참가자' },
    {
      title: '신청 관리',
      description: '전 프로그램 접수 목록',
      href: registrationRoutes.applications,
    },
    {
      title: '만족도 조사',
      description: '만족도 조사 관리',
      href: registrationRoutes.survey,
    },
    {
      title: '모니터링',
      description: '실시간 입·퇴장 현황',
      href: registrationRoutes.attendance,
    },
  ];

  const renderAction = (action: ExpoAction) => (
    <Button
      key={action.title}
      variant="white"
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
          <div className="flex w-full flex-col gap-8 tablet:grid tablet:grid-cols-2 tablet:gap-16">
            {panelActions.map(renderAction)}
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
