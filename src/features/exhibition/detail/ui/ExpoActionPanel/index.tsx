'use client';

import { getExpoActionGroups, useRunExpoAction } from '@/entities/exhibition';
import { Button } from '@/shared/ui';

interface ExpoActionPanelProps {
  params: string;
  openModal: (type: string, content: string) => void;
}

/** 박람회 상세 오른쪽 운영 기능. 더보기 없이 그룹별로 모든 진입점을 같은 버튼으로 보인다 */
const ExpoActionPanel = ({ params, openModal }: ExpoActionPanelProps) => {
  const run = useRunExpoAction(openModal);
  const groups = getExpoActionGroups(params);

  return (
    <div className="flex w-full flex-col gap-24 rounded-sm border-1 border-solid border-gray-200 p-[18px] tablet:border-none tablet:px-0">
      {groups.map((group) => (
        // 그룹 제목은 보이지 않고, 그룹 사이 간격으로만 묶음을 나눈다
        <section key={group.key} aria-label={group.title}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,180px),1fr))] gap-12">
            {group.actions
              .flatMap(({ primary, more = [] }) => [primary, ...more])
              .map((link) => (
                <Button
                  key={link.label}
                  variant="white"
                  onClick={() => run(link)}
                >
                  {link.label}
                </Button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ExpoActionPanel;
