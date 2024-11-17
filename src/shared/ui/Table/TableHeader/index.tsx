import React from 'react';

const TableHeader = () => {
  const categories = [
    '번호',
    '성명',
    '소속',
    '직급',
    '중고등학교인 교과명',
    '안내문자 발송용 연락처',
  ];
  return (
    <div className="flex items-center justify-between border-b-1 border-solid border-gray-100 py-6">
      {categories.map((category, index) => (
        <div key={index} className="flex-1">
          <p className="text-center text-caption1 text-gray-500">{category}</p>
        </div>
      ))}
    </div>
  );
};

export default TableHeader;
