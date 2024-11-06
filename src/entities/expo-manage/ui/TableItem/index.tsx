import React from 'react';

const TableItem = () => {
  const items = ['1', '김진원', '고등학교', '학생', '수학', '01012345678'];
  return (
    <div className="mr-5 flex items-center justify-between rounded-sm border-1 border-solid border-gray-200 py-2">
      {items.map((item, index) => (
        <div key={index} className="flex-1">
          <p className="text-center text-caption1 text-gray-500">{item}</p>
        </div>
      ))}
    </div>
  );
};

export default TableItem;
