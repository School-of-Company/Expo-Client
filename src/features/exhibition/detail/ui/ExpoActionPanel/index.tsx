'use client';

import { getExpoActionGroups, useRunExpoAction } from '@/entities/exhibition';
import { Button, TextButton } from '@/shared/ui';

interface ExpoActionPanelProps {
  params: string;
  openModal: (type: string, content: string) => void;
}

/** 박람회 상세 오른쪽 운영 기능. 더보기 없이 그룹별로 모두 보인다 */
const ExpoActionPanel = ({ params, openModal }: ExpoActionPanelProps) => {
  const run = useRunExpoAction(openModal);
  const groups = getExpoActionGroups(params);

  return (
    <div className="flex w-full flex-col gap-24 rounded-sm border-1 border-solid border-gray-200 p-[18px] tablet:border-none tablet:px-0">
      {groups.map((group) => (
        <section key={group.key} className="space-y-12">
          <h2 className="text-caption1b text-gray-500">{group.title}</h2>
          <div className="grid gap-12 mobile:grid-cols-1 tablet:grid-cols-2">
            {group.actions.map(({ key, primary, more }) => (
              <div key={key} className="space-y-6">
                <Button variant="white" onClick={() => run(primary)}>
                  {primary.label}
                </Button>
                {more && (
                  <div className="flex flex-wrap gap-x-12 gap-y-4 px-4">
                    {more.map((link) => (
                      <TextButton
                        key={link.label}
                        size="small"
                        onClick={() => run(link)}
                      >
                        {link.label}
                      </TextButton>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ExpoActionPanel;
