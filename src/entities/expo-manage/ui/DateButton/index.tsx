import React from 'react';

const DateButton = ({
  date,
  onClick,
  selected,
}: {
  date: string;
  onClick?: () => void;
  selected?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border-1 border-solid px-10 py-8 text-caption1r ${selected ? 'border-main-600 bg-main-600 text-white' : 'border-gray-200 bg-white text-main-600'}`}
    >
      {date}
    </button>
  );
};

export default DateButton;
