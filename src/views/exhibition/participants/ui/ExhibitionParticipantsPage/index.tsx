'use client';

import { useRouter } from 'next/navigation';
import { ParticipantTable } from '@/features/exhibition/participants';
import { DetailHeader } from '@/shared/ui';
import { Header } from '@/widgets/layout';

const ExhibitionParticipantsPage = ({ id }: { id: string }) => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 flex-col items-center gap-30 p-16">
        {/* 주소로 바로 열어도 박람회 상세로 돌아가게 한다 */}
        <div className="w-full max-w-[1200px]">
          <DetailHeader
            className="gap-12"
            headerTitle="참가자"
            onBack={() =>
              router.push(`/exhibition/detail/${encodeURIComponent(id)}`)
            }
          />
        </div>
        <ParticipantTable id={id} />
      </div>
    </div>
  );
};

export default ExhibitionParticipantsPage;
