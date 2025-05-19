import { ExpoListContainer } from '@/features/exhibition/list';
import { Header } from '@/widgets/layout';

const ExhibitionListPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ExpoListContainer />
      </div>
    </div>
  );
};

export default ExhibitionListPage;
