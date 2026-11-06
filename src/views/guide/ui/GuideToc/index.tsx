'use client';

import { useEffect, useRef, useState } from 'react';
import { GUIDE_TOC, GuideSectionId } from '../../model/guideSections';

/**
 * 사용법 목차. 데스크톱은 왼쪽에 고정하고 모바일은 헤더 아래 가로 줄로 붙인다.
 * 화면 위쪽에 걸린 섹션을 따라 현재 항목을 표시한다
 */
const GuideToc = () => {
  const [activeId, setActiveId] = useState<GuideSectionId>(GUIDE_TOC[0].id);
  const listRef = useRef<HTMLUListElement>(null);

  // 모바일 가로 목차는 현재 항목이 가려지지 않게 그 칩을 가운데로 민다. 세로 목차는 넘치지 않아 그대로다
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current]');
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({
      left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2,
      behavior: 'smooth',
    });
  }, [activeId]);

  useEffect(() => {
    const sections = GUIDE_TOC.map(({ id }) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);

    // 제목이 헤더(·모바일 목차) 바로 아래 선을 넘은 마지막 섹션을 현재 위치로 본다.
    // 맨 아래까지 내리면 마지막 섹션은 그 선에 닿지 못하므로 따로 마지막을 고른다
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      const current = atBottom
        ? sections[sections.length - 1]
        : sections
            .filter((section) => section.getBoundingClientRect().top <= 160)
            .pop();
      setActiveId((current?.id ?? GUIDE_TOC[0].id) as GuideSectionId);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <nav
      aria-label="사용법 목차"
      className="sticky top-[112px] mobile:static mobile:-mx-16 mobile:border-b mobile:border-solid mobile:border-gray-100 mobile:bg-white"
    >
      <p className="mb-12 pl-16 text-caption2b text-gray-400 mobile:hidden">
        목차
      </p>
      <ul
        ref={listRef}
        className="relative flex flex-col border-l-2 border-solid border-gray-100 mobile:flex-row mobile:gap-4 mobile:overflow-x-auto mobile:border-l-0 mobile:px-16 mobile:py-8"
      >
        {GUIDE_TOC.map(({ id, title }) => {
          const isActive = id === activeId;
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => setActiveId(id)}
                className={`-ml-2 flex min-h-[40px] items-center border-l-2 border-solid px-14 text-caption1r transition-colors mobile:ml-0 mobile:min-h-[36px] mobile:rounded-full mobile:border-l-0 mobile:px-12 ${
                  isActive
                    ? 'border-main-600 text-caption1b text-main-600 mobile:bg-main-100'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                {title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default GuideToc;
