import React from 'react';

interface Props {
  title: string;
  content: string;
}

const ContentText = ({ title, content }: Props) => {
  return (
    <div className="flex flex-col gap-[0.88rem] space-y-4">
      <p className="text-body1b text-gray-600">{title}</p>
      <p className="text-body2 text-gray-400">{content}</p>
    </div>
  );
};

export default ContentText;
