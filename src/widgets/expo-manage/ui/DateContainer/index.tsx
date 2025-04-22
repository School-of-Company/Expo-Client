'use client';

import { eachDayOfInterval, parseISO, format } from 'date-fns';
import React, { useState, useRef, useEffect } from 'react';
import { DateButton } from '@/entities/expo-manage';
import { ArrowLeft, ArrowRight } from '@/shared/assets/icons';

const DateContainer = ({
  startedDay,
  finishedDay,
  onDateSelect,
  selectedDate,
}: {
  startedDay: string;
  finishedDay: string;
  onDateSelect: (date: string) => void;
  selectedDate: string;
}) => {
  const dates = eachDayOfInterval({
    start: parseISO(startedDay),
    end: parseISO(finishedDay),
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    const handleResize = () => checkArrowVisibility();
    checkArrowVisibility();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dates]);

  useEffect(() => {
    const selectedButton = buttonRefs.current[selectedDate];
    if (selectedDate && selectedButton) {
      selectedButton.scrollIntoView({
        behavior: initialScrollDone.current ? 'smooth' : 'auto',
        inline: 'center',
        block: 'nearest',
      });
      initialScrollDone.current = true;

      requestAnimationFrame(() => {
        checkArrowVisibility();
      });
    }
  }, [selectedDate]);

  const checkArrowVisibility = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  const handleScroll = () => {
    checkArrowVisibility();
  };

  const scrollLeft = () => {
    containerRef.current?.scrollBy({
      left: -120,
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    containerRef.current?.scrollBy({
      left: 120,
      behavior: 'smooth',
    });
  };

  const setButtonRef = (date: string, element: HTMLButtonElement | null) => {
    buttonRefs.current[date] = element;
  };

  return (
    <div className="relative flex items-center">
      {showLeftArrow && (
        <button
          type="button"
          onClick={scrollLeft}
          aria-label="Scroll left"
          className="absolute left-0 z-10 px-4"
        >
          <ArrowLeft />
        </button>
      )}

      <div
        ref={containerRef}
        className="no-scrollbar flex items-center gap-12 overflow-x-auto px-16 py-2"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((date) => {
          const formattedDate = format(date, 'yyyy-MM-dd');
          return (
            <DateButton
              key={formattedDate}
              date={formattedDate}
              selected={formattedDate === selectedDate}
              onClick={() => onDateSelect(formattedDate)}
              ref={(el) => setButtonRef(formattedDate, el)}
            />
          );
        })}
      </div>

      {showRightArrow && (
        <button
          type="button"
          onClick={scrollRight}
          aria-label="Scroll right"
          className="absolute right-0 z-10 px-4"
        >
          <ArrowRight />
        </button>
      )}
    </div>
  );
};

export default DateContainer;
