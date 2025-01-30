'use client';

import React, { useState } from 'react';
import { preventEvent } from '@/shared/model/preventEvent';

function ToggleButton() {
  const [isToggled, setIsToggled] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    preventEvent(e);
    setIsToggled(!isToggled);
  };

  return (
    <button
      onClick={toggle}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${isToggled ? 'bg-main-100' : 'bg-gray-100'}`}
    >
      <span
        className={`inline-block h-7 w-7 transform rounded-full transition-transform duration-300 ${
          isToggled ? 'translate-x-9 bg-main-600' : 'translate-x-0 bg-gray-500'
        }`}
      />
    </button>
  );
}

export default ToggleButton;
