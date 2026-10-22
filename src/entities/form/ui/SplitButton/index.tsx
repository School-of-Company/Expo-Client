'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Plus, ArrowDown } from '@/shared/assets/icons';
import { COLORS } from '@/shared/config';

// 고정 헤더에 가려지지 않으려면 메뉴 위쪽이 이 값(px)보다 아래에 있어야 한다
const HEADER_SAFE_TOP = 80;

interface SplitButtonProps<T extends string> {
  onDefaultClick: () => void;
  onSpecialFieldClick: (type: T) => void;
  specialFieldOptions: { value: T; label: string }[];
  text?: string;
  disabledOptions?: Set<string>;
}

const SplitButton = <T extends string>({
  onDefaultClick,
  onSpecialFieldClick,
  specialFieldOptions,
  text = '추가하기',
  disabledOptions = new Set(),
}: SplitButtonProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // 기본은 버튼 위로 연다. 위쪽이 화면 밖이나 고정 헤더에 가려지면 아래로 연다
  const [placement, setPlacement] = useState<'up' | 'down'>('up');

  useLayoutEffect(() => {
    if (!isOpen) {
      setPlacement('up');
      return;
    }
    const menuTop = menuRef.current?.getBoundingClientRect().top;
    if (menuTop !== undefined && menuTop < HEADER_SAFE_TOP)
      setPlacement('down');
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSpecialFieldClick = (type: T) => {
    if (!disabledOptions.has(type)) {
      onSpecialFieldClick(type);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={onDefaultClick}
          className={`flex items-center gap-12 bg-main-100 px-16 py-12 ${
            specialFieldOptions.length > 0 ? 'rounded-l-sm' : 'rounded-sm'
          }`}
        >
          <Plus fill={COLORS.main600} />
          <p className="text-body2r text-main-600">{text}</p>
        </button>

        {specialFieldOptions.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center rounded-r-sm bg-main-100 px-8 py-12"
          >
            <ArrowDown fill={COLORS.main600} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute left-0 z-10 w-full min-w-[160px] rounded-sm border-1 border-solid border-gray-200 bg-white shadow-lg ${
            placement === 'up' ? 'bottom-full mb-4' : 'top-full mt-4'
          }`}
        >
          {specialFieldOptions.map((option) => {
            const isDisabled = disabledOptions.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSpecialFieldClick(option.value)}
                disabled={isDisabled}
                className={`w-full px-16 py-12 text-left text-body2r first:rounded-t-sm last:rounded-b-sm ${
                  isDisabled
                    ? 'cursor-not-allowed text-gray-400 opacity-50'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SplitButton;
