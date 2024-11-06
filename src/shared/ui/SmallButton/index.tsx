import React from 'react';

const SmallButton = ({ text }: { text: string }) => {
  return (
    <button className="rounded-sm bg-main-600 px-[30px] py-[6px] text-body2 text-white">
      {text}
    </button>
  );
};

export default SmallButton;
