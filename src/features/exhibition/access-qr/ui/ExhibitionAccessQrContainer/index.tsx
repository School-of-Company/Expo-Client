import { ExhibitionAccessQr } from '@/entities/exhibition';
import { Logo } from '@/shared/assets/svg';

const ExhibitionAccessQrContainer = ({
  path,
  label,
}: {
  path: string;
  label: string;
}) => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-24">
      <Logo className="h-[114px] w-[396px] tablet:h-[80px] tablet:w-[280px]" />
      <ExhibitionAccessQr path={path} />
      <p className="break-keep text-center text-h2b text-black mobile:text-h3b">
        {label}
      </p>
    </div>
  );
};

export default ExhibitionAccessQrContainer;
