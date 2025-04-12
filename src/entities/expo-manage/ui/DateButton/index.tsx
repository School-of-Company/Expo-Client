import React, { forwardRef } from 'react';

const DateButton = forwardRef<
  HTMLButtonElement,
  {
    date: string;
    onClick?: () => void;
    selected?: boolean;
  }
>(({ date, onClick, selected }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`w-fit whitespace-nowrap rounded-sm border-1 border-solid px-10 py-8 text-caption1r ${
        selected
          ? 'border-main-600 bg-main-600 text-white'
          : 'border-gray-200 bg-white text-main-600'
      }`}
    >
      {date}
    </button>
  );
});

DateButton.displayName = 'DateButton';

export default DateButton;
