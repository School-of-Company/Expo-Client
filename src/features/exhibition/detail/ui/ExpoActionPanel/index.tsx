'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { ExpoAction, getExpoActions } from '@/entities/exhibition';
import { Share } from '@/shared/assets/svg';
import { getExpoRoutes, getRegistrationRoutes } from '@/shared/config';
import { Button } from '@/shared/ui';

interface ExpoActionPanelProps {
  params: string;
  onShare: () => void;
}

const ExpoActionPanel = ({ params, onShare }: ExpoActionPanelProps) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const actions = getExpoActions(params);
  const registrationRoutes = getRegistrationRoutes(params);

  // 박람회 운영 페이지는 getExpoActions 전체를 카드로 보여 주고, 패널은 자주 쓰는 메뉴만 간추려 보여 준다
  const panelActions: ExpoAction[] = [
    {
      title: '박람회 수정',
      description: '박람회 정보 수정',
      href: getExpoRoutes(params).edit,
    },
    actions.formCreate,
    // 만든 등록용 폼·만족도 조사는 신청관리 폼 탭에서 고친다
    {
      title: '폼 수정',
      description: '등록용 폼·만족도 조사 수정',
      href: registrationRoutes.forms,
    },
    {
      title: 'QR',
      description: '현장 등록 QR·박람회 입장·종이 QR 발급',
      href: getExpoRoutes(params).qr,
    },
    { ...actions.participants, title: '참가자' },
    {
      title: '신청관리',
      description: '프로그램 신청 회차·모집 관리',
      href: registrationRoutes.schedule,
    },
    {
      title: '만족도 조사',
      description: '만족도 조사 관리',
      href: registrationRoutes.survey,
    },
    {
      title: '모니터링/관리',
      description: '실시간 대시보드·접수대장·행정 이력·입·퇴장',
      href: registrationRoutes.dashboard,
    },
  ];

  const renderAction = (action: ExpoAction) => (
    <Button
      key={action.title}
      variant="white"
      onClick={() => router.push(action.href)}
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
            onClick={onShare}
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
