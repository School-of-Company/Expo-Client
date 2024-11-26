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
  return (
    <div className="space-y-4">
      <p className="text-body1 font-bold text-gray-600">{title}</p>
      {data.map((item, index) => (
        <div key={index} className="items-cente flex gap-3">
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
