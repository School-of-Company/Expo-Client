import React from 'react';

interface Props {
  categories: string[];
}

const TableHeader = ({ categories }: Props) => {
  return (
    <div className="mr-7 flex items-center justify-between border-b-1 border-solid border-gray-100 py-6">
      {categories.map((category, index) => (
        <div key={index} className="flex-1">
          <p className="text-caption1 text-center text-gray-500">{category}</p>
        </div>
      ))}
    </div>
  );
};

export default TableHeader;
