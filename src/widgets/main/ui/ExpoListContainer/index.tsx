import { ExpoListItem, Filter } from '@/entities/main';

import { ExpoListMock } from '../../model/ExpoListMock';

const ExpoListContainer = () => {
  return (
    <div>
      <div className="mb-[30px] flex justify-between">
        <p className="text-h1 text-black">박람회 신청</p>
        <Filter />
      </div>

      <div className="grid grid-cols-3 gap-4 mobile:grid-cols-1">
        {ExpoListMock.map((item, index) => (
          <ExpoListItem
            key={index}
            clubName={item.clubName}
            description={item.description}
            startDate={item.startDate}
            endDate={item.endDate}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpoListContainer;
