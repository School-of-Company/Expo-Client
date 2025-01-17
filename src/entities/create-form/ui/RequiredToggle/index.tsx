import React from 'react';
import { ToggleButton } from '@/shared/ui';

const RequiredToggle = () => {
  return (
    <label className="flex items-center gap-6">
      <p className="text-caption2 text-black">필수</p>
      <ToggleButton />
    </label>
  );
};

export default RequiredToggle;
