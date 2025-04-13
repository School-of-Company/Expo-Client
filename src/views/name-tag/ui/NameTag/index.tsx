import { Header } from '@/widgets/layout';
import { NameTagForm } from '@/widgets/name-tag';

const NameTag = ({ id }: { id: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <NameTagForm id={id} />
      </div>
    </div>
  );
};

export default NameTag;
