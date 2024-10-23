import React from 'react';

const ModalButton = ({ text, bgColor }: { text: string; bgColor: string }) => {
  return (
    <button className={`${bgColor} w-full rounded-sm py-3 text-white`}>
      {text}
    </button>
  );
};

export default ModalButton;
