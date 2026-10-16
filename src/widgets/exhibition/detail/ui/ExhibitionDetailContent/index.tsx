import {
  ExpoActionPanel,
  ExpoDetailLayout,
} from '@/features/exhibition/detail';
import {
  ExpoDetail,
  ExpoStandard,
  ExpoTrainingDetail,
} from '@/shared/types/exhibition/detail/type';

interface ExhibitionDetailContentProps {
  expoDetail: ExpoDetail;
  expoStandard: ExpoStandard[];
  expoTraining: {
    essential: ExpoTrainingDetail[];
    choice: ExpoTrainingDetail[];
  };
  params: string;
  openModal: (type: string, content: string) => void;
}

const ExhibitionDetailContent = ({
  expoDetail,
  expoStandard,
  expoTraining,
  params,
  openModal,
}: ExhibitionDetailContentProps) => {
  return (
    <div className="flex w-full max-w-[1000px] flex-1 gap-40 tablet:w-full tablet:max-w-none tablet:flex-col">
      <div className="w-full max-w-[750px] tablet:w-full tablet:max-w-none">
        <ExpoDetailLayout
          expoDetail={expoDetail}
          expoStandard={expoStandard}
          expoTraining={expoTraining}
          expoId={params}
        />
      </div>
      <div className="w-full max-w-[210px] tablet:w-full tablet:max-w-none">
        <ExpoActionPanel params={params} openModal={openModal} />
      </div>
    </div>
  );
};

export default ExhibitionDetailContent;
