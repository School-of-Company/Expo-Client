import React from 'react';

interface ExpoStandard {
  title: string;
  startedAt: string;
  endedAt: string;
}

interface Props {
  data: ExpoStandard[];
  title: string;
}

const ContentListText = ({ data, title }: Props) => {
  // data가 없으면 빈 배열로 처리
  const validData = data || [];

  return (
    <div className="space-y-4">
      <p className="text-body1 font-bold text-gray-600">{title}</p>
      {validData.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <p className="text-body1 text-gray-400">- {item.title}</p>
          <p className="text-body2 text-gray-400">
            ({item.startedAt} ~ {item.endedAt})
          </p>
        </div>
      ))}
    </div>
  );
};

export default ContentListText;
