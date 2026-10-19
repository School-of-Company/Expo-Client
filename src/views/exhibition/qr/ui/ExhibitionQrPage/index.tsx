'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AccessQrPanel } from '@/features/exhibition/access-qr';
import { QRScannerTable } from '@/features/exhibition/check-in';
import { PaperQrPrintBoard } from '@/features/exhibition/paper-qr';
import { SegmentTabs } from '@/features/registration/common';
import {
  EXPO_QR_TABS,
  ExpoQrTab,
  getRegistrationRoutes,
} from '@/shared/config';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { DetailHeader } from '@/shared/ui';
import { Header } from '@/widgets/layout';

const TAB_OPTIONS: { value: ExpoQrTab; label: string }[] = [
  { value: EXPO_QR_TABS.checkIn, label: '박람회 입장' },
  { value: EXPO_QR_TABS.paper, label: '종이 QR 발급' },
  { value: EXPO_QR_TABS.access, label: '현장 등록 QR' },
];

const isTab = (value: string | null): value is ExpoQrTab =>
  TAB_OPTIONS.some((option) => option.value === value);

interface ExhibitionQrPageProps {
  /** 현장 등록 QR 에 담는 ID. 예전 현장 등록 QR 화면처럼 주소의 값을 그대로 쓴다 */
  id: string;
  /** 입장 체크인용. 출석 서버가 대소문자를 가려 UUID 는 소문자로 맞춘 값 */
  checkInId: string;
  /** 종이 QR 발급용. 발급 API 는 소문자 UUID 만 받아 아니면 null */
  paperQrId: string | null;
}

/**
 * 현장 등록 QR·박람회 입장·종이 QR 발급을 한 화면의 탭으로 묶는다.
 * 고른 탭만 그려서 USB 스캐너 입력은 박람회 입장 탭에서만 처리한다
 */
const ExhibitionQrPage = ({
  id,
  checkInId,
  paperQrId,
}: ExhibitionQrPageProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: ExpoQrTab = isTab(tabParam) ? tabParam : EXPO_QR_TABS.checkIn;
  const userType = searchParams.get('userType');
  const applicationType = (searchParams.get('applicationType') ||
    'PRE') as ApplicationType;

  // 탭과 QR 대상을 주소에 남겨 새로고침하거나 링크로 열어도 같은 화면이 나오게 한다
  const updateQuery = (next: Record<string, string>) => {
    const query = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => query.set(key, value));
    router.replace(`${pathname}?${query.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <div className="flex w-full max-w-[1200px] flex-col gap-30">
          <div className="flex flex-col gap-16">
            {/* 주소로 바로 열어도 박람회 상세로 돌아가게 한다 */}
            <DetailHeader
              className="gap-12"
              headerTitle="QR"
              onBack={() =>
                router.push(
                  `/admin/exhibition/detail/${encodeURIComponent(id)}`,
                )
              }
            />
            <SegmentTabs
              ariaLabel="QR 메뉴"
              value={tab}
              options={TAB_OPTIONS}
              onChange={(value) => updateQuery({ tab: value })}
            />
          </div>
          {tab === EXPO_QR_TABS.access && (
            <AccessQrPanel
              id={id}
              userType={userType}
              applicationType={applicationType}
              onSelect={(nextUserType, nextApplicationType) =>
                updateQuery({
                  userType: nextUserType,
                  applicationType: nextApplicationType,
                })
              }
            />
          )}
          {tab === EXPO_QR_TABS.checkIn && <QRScannerTable id={checkInId} />}
          {tab === EXPO_QR_TABS.paper && (
            <div className="flex w-full flex-col gap-24">
              <div className="flex flex-wrap items-center justify-between gap-12 rounded-sm bg-gray-100 px-16 py-12">
                <p className="break-keep text-body2r text-gray-600">
                  개인정보 없는 박람회 입장 전용 QR입니다. 프로그램
                  신청·출석에는 쓸 수 없습니다.
                </p>
                <Link
                  href={getRegistrationRoutes(checkInId).dashboard}
                  className="rounded-sm border-1 border-solid border-gray-200 bg-white px-16 py-8 text-caption1b text-gray-700"
                >
                  관리자 대시보드
                </Link>
              </div>
              {paperQrId ? (
                <PaperQrPrintBoard expoId={paperQrId} />
              ) : (
                <p className="rounded-sm bg-gray-100 px-16 py-24 text-center text-body2r text-gray-500">
                  UUID 형식 ID를 쓰는 박람회만 종이 QR을 발급할 수 있습니다.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExhibitionQrPage;
