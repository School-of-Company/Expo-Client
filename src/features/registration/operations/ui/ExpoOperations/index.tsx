'use client';

import Link from 'next/link';
import {
  ExpoActionItem,
  getExpoActionGroups,
  useRunExpoAction,
} from '@/entities/exhibition';
import { ArrowRight } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';
import { useRegistrationExpo } from '../../../common';

const MAIN_CLASS = 'flex w-full items-center justify-between gap-16 text-left';

// 카드 제목은 눌렀을 때 하는 일(primary.label)로 보여 준다. 묶인 기능 이름(title)은 카드 이름으로만 쓴다
const CardBody = ({ primary, description }: ExpoActionItem) => (
  <>
    <div className="min-w-0 space-y-8">
      <p className="text-body1b text-black">{primary.label}</p>
      <p className="text-caption1r text-gray-500">{description}</p>
    </div>
    <ArrowRight />
  </>
);

interface ExpoOperationsProps {
  onOpenModal: (type: string, text: string) => void;
}

/** 박람회 상세 패널(ExpoActionPanel)과 같은 운영 기능 그룹을 카드로 모은다 */
const ExpoOperations = ({ onOpenModal }: ExpoOperationsProps) => {
  const { expoId } = useRegistrationExpo();
  const run = useRunExpoAction(onOpenModal);
  const groups = getExpoActionGroups(expoId);

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col gap-40">
      {groups.map((group) => (
        <section key={group.key} className="space-y-16">
          <h2 className="text-h3b text-black">{group.title}</h2>
          <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
            {group.actions.map((action) => (
              <div
                key={action.key}
                role="group"
                aria-label={action.title}
                className="flex flex-col gap-12 rounded-sm border-1 border-solid border-gray-200 px-30 py-20 duration-200 hover:border-main-600 mobile:px-16"
              >
                {'href' in action.primary ? (
                  <Link href={action.primary.href} className={MAIN_CLASS}>
                    <CardBody {...action} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => run(action.primary)}
                    className={MAIN_CLASS}
                  >
                    <CardBody {...action} />
                  </button>
                )}
                {action.more && (
                  <div className="flex flex-wrap gap-8">
                    {action.more.map((link) => (
                      <Button
                        key={link.label}
                        size="small"
                        variant="white"
                        onClick={() => run(link)}
                      >
                        {link.label}
                      </Button>
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

export default ExpoOperations;
