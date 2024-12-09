'use client';

import { ExpoListItem, Filter } from '@/entities/main';
import { useExpoList } from '../../api/useExpoList';

const ExpoListContainer = () => {
  const { data: expoList, isLoading } = useExpoList();
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <div className="mb-[30px] flex justify-between">
        <p className="text-h1 text-black">박람회 신청</p>
        <Filter />
      </div>

      <div className="grid grid-cols-3 gap-4 mobile:grid-cols-1">
        {expoList?.map((item, index) => (
          <ExpoListItem
            id={item.id}
            coverImage={item.coverImage}
            key={index}
            title={item.title}
            description={item.description}
            startedDay={item.startedDay}
            finishedDay={item.finishedDay}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpoListContainer;
