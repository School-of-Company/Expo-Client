import React from 'react';

interface Props {
  icon?: React.ReactNode;
  text: string;
}

const OtherOption = ({ icon, text }: Props) => {
  return (
    <div className="flex w-full items-center gap-[10px]">
      {icon}
      <p className="text-body4 text-black">{text}</p>
      <p className="text-caption2 text-gray-300">(직접입력)</p>
    </div>
  );
};

export default OtherOption;
