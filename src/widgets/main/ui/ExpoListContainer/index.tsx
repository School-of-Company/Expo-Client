'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { ExpoListItem, Filter } from '@/entities/main';

interface ExpoItem {
  id: number;
  coverImage: string;
  title: string;
  description: string;
  startedDay: string;
  finishedDay: string;
}

const ExpoListContainer = () => {
  const [expoList, setExpoList] = useState<ExpoItem[]>([]);
  useEffect(() => {
    axios.get('/api/expo').then((res) => {
      setExpoList(res.data);
    });
  }, []);
  return (
    <div>
      <div className="mb-[30px] flex justify-between">
        <p className="text-h1 text-black">박람회 신청</p>
        <Filter />
      </div>

      <div className="grid grid-cols-3 gap-4 mobile:grid-cols-1">
        {expoList.slice(0, 5).map((item, index) => (
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
