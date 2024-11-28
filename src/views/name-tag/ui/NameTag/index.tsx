import { Header } from '@/widgets/layout';
import { NameTagForm } from '@/widgets/name-tag';

const NameTag = () => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-5">
      <Header />
      <NameTagForm />
    </div>
  );
};

export default NameTag;
