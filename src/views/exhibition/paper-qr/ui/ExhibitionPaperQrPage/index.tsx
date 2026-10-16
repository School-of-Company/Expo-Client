import Link from 'next/link';
import { PaperQrPrintBoard } from '@/features/exhibition/paper-qr';
import { getRegistrationRoutes } from '@/shared/config';
import { PageTitle } from '@/shared/ui';
import { PageShell } from '@/widgets/layout';

const ExhibitionPaperQrPage = ({ id }: { id: string }) => {
  return (
    <PageShell>
      <div className="flex w-full max-w-[1120px] flex-col gap-24">
        <PageTitle
          title="현장 배부용 QR 인쇄"
          description="개인정보 없는 박람회 입장 전용 QR입니다. 프로그램 신청이나 출석 확인에는 쓸 수 없습니다."
          action={
            <Link
              href={getRegistrationRoutes(id).dashboard}
              className="rounded-sm border-1 border-solid border-gray-200 px-16 py-8 text-caption1b text-gray-700"
            >
              관리자 대시보드
            </Link>
          }
        />
        <PaperQrPrintBoard expoId={id} />
      </div>
    </PageShell>
  );
};

export default ExhibitionPaperQrPage;
