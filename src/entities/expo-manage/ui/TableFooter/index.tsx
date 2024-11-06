import React from 'react';
import SmallButton from '@/shared/ui/SmallButton';

const TableFooter = ({ num = 100 }: { num?: number }) => {
  return (
    <div className="flex justify-between">
      <div className="flex gap-6">
        <p className="text-body2 text-gray-500">참가자 전체 인원</p>
        <p className="text-body2 text-main-600">{num}명</p>
      </div>
      <div className="flex items-center gap-6">
        <p className="text-body1 text-gray-400">출력</p>
        <SmallButton text="PDF" />
        <SmallButton text="Exel" />
      </div>
    </div>
  );
};

export default TableFooter;
