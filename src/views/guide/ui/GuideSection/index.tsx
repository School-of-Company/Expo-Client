import { ReactNode } from 'react';
import { GUIDE_TOC, GuideSectionId } from '../../model/guideSections';

interface GuideSectionProps {
  id: GuideSectionId;
  summary: string;
  children: ReactNode;
}

const GuideSection = ({ id, summary, children }: GuideSectionProps) => {
  const index = GUIDE_TOC.findIndex((item) => item.id === id);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      // 고정 헤더와 모바일 목차 줄에 제목이 가리지 않게 한다
      className="flex scroll-mt-[96px] flex-col gap-20 mobile:scroll-mt-[136px]"
    >
      <div className="flex flex-col gap-6">
        <span className="text-caption2b text-main-600">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 id={`${id}-title`} className="text-h3b text-black">
          {GUIDE_TOC[index].title}
        </h2>
        <p className="break-keep text-body2r text-gray-500">{summary}</p>
      </div>
      {children}
    </section>
  );
};

export default GuideSection;
