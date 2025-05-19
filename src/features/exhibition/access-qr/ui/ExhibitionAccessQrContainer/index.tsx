import { ExhibitionAccessQr } from '@/entities/exhibition';
import { Logo } from '@/shared/assets/svg';

const ExhibitionAccessQrContainer = ({
  id,
  userType,
}: {
  id: string;
  userType: string;
}) => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-24">
      <Logo className="h-[114px] w-[396px] tablet:h-[80px] tablet:w-[280px]" />
      <ExhibitionAccessQr id={id} userType={userType} />
    </div>
  );
};

export default ExhibitionAccessQrContainer;
