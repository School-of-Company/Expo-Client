'use client';

import { useMemo, useState } from 'react';

export interface OptionType {
  value: string;
  label: string;
}

export const selectUserType = () => {
  const options = useMemo(
    () => [
      { value: '참가자', label: '참가자' },
      { value: '연수자', label: '연수자' },
    ],
    [],
  );

  const defaultOption = useMemo(
    () => options.find((option) => option.value === '참가자') || options[0],
    [options],
  );

  const [selectedOption, setSelectedOption] =
    useState<OptionType>(defaultOption);
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: OptionType) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  return {
    options,
    selectedOption,
    isOpen,
    handleOptionClick,
    toggleOpen,
  };
};
