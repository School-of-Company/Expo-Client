import { useMemo, useState } from 'react';
import { OptionType } from './types';

export const useExpoListSelect = () => {
  const options = useMemo(
    () => [
      { value: '최신순', label: '최신순' },
      { value: '오래된순', label: '오래된순' },
    ],
    [],
  );

  const defaultOption = useMemo(
    () => options.find((option) => option.value === '좋아요순') || options[0],
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
