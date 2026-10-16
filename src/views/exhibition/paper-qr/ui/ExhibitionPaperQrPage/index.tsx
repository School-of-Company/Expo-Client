'use client';

// access-qr 묶음이 훅을 쓰는 entities 컴포넌트를 함께 불러와 서버 컴포넌트로 두면 빌드가 깨진다
import Link from 'next/link';
import { FieldQrLauncher } from '@/features/exhibition/access-qr';
import { PaperQrPrintBoard } from '@/features/exhibition/paper-qr';
import { getRegistrationRoutes } from '@/shared/config';
import { PageTitle } from '@/shared/ui';
import { PageShell } from '@/widgets/layout';

/** 현장 QR 페이지. 현장 신청 QR 띄우기와 종이 입장 QR 발급을 한곳에서 한다 */
const ExhibitionPaperQrPage = ({ id }: { id: string }) => {
  return (
    <PageShell>
      <div className="flex w-full max-w-[1120px] flex-col gap-24">
        <PageTitle
          title="현장 QR"
          description="현장 신청용 QR을 화면에 띄우거나, 개인정보 없는 박람회 입장 전용 종이 QR을 발급·인쇄합니다. 종이 QR은 프로그램 신청이나 출석 확인에는 쓸 수 없습니다."
          action={
            <Link
              href={getRegistrationRoutes(id).dashboard}
              className="rounded-sm border-1 border-solid border-gray-200 px-16 py-8 text-caption1b text-gray-700"
            >
              관리자 대시보드
            </Link>
          }
        />
        <FieldQrLauncher expoId={id} />
        <PaperQrPrintBoard expoId={id} />
      </div>
    </PageShell>
  );
};

export default ExhibitionPaperQrPage;
