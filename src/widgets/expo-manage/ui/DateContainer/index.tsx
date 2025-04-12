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
    checkArrowVisibility();
    window.addEventListener('resize', checkArrowVisibility);
    return () => {
      window.removeEventListener('resize', checkArrowVisibility);
    };
  }, [dates]);

  useEffect(() => {
    if (
      selectedDate &&
      containerRef.current &&
      buttonRefs.current[selectedDate]
    ) {
      // Use a small delay to ensure DOM is fully updated
      setTimeout(() => {
        const button = buttonRefs.current[selectedDate];
        if (button && containerRef.current) {
          const container = containerRef.current;

          // Calculate position to center the button in the container
          const scrollLeft =
            button.offsetLeft -
            container.offsetWidth / 2 +
            button.offsetWidth / 2;

          // Scroll to the position
          container.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: initialScrollDone.current ? 'smooth' : 'auto',
          });

          initialScrollDone.current = true;

          // Check arrow visibility after scrolling completes
          setTimeout(checkArrowVisibility, 500);
        }
      }, 50);
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
    // Only check visibility, don't modify scroll position here
    checkArrowVisibility();
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      const scrollAmount = 120;
      containerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const scrollAmount = 120;
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const setButtonRef = (date: string, element: HTMLButtonElement | null) => {
    buttonRefs.current[date] = element;
  };

  return (
    <div className="relative flex items-center">
      {showLeftArrow && (
        <button
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
