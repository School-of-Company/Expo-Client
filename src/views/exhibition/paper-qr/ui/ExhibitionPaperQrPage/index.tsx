import Link from 'next/link';
import { PaperQrPrintBoard } from '@/features/exhibition/paper-qr';
import { getRegistrationRoutes } from '@/shared/config';
import { Header } from '@/widgets/layout';

const ExhibitionPaperQrPage = ({ id }: { id: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <div className="flex w-full max-w-[1120px] flex-col gap-24">
          <div className="flex flex-wrap items-end justify-between gap-12">
            <div className="space-y-8">
              <p className="text-h2b text-black">현장 배부용 QR 인쇄</p>
              <p className="break-keep text-body2r text-gray-500">
                개인정보 없는 박람회 입장 전용 QR입니다. 프로그램 신청이나 출석
                확인에는 쓸 수 없습니다.
              </p>
            </div>
            <Link
              href={getRegistrationRoutes(id).dashboard}
              className="rounded-sm border-1 border-solid border-gray-200 px-16 py-8 text-caption1b text-gray-700"
            >
              관리자 대시보드
            </Link>
          </div>
          <PaperQrPrintBoard expoId={id} />
        </div>
      </div>
    </div>
  );
};

export default ExhibitionPaperQrPage;
