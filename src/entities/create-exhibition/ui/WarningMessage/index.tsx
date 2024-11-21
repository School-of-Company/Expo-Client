import React from 'react';
import { Warning } from '@/shared/assets/icons';

const WarningMessage = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center gap-3">
      <label>
        <Warning />
      </label>
      <p className="text-caption2 text-gray-300">{text}</p>
    </div>
  );
};

export default WarningMessage;
