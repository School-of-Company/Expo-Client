'use client';

import Link from 'next/link';
import { ExpoAction, getExpoActions } from '@/entities/exhibition';
import { ArrowRight } from '@/shared/assets/icons';
import { DetailHeader } from '@/shared/ui';
import { useRegistrationExpo } from '../../../common';

const CARD_CLASS =
  'flex items-center justify-between gap-16 rounded-sm border-1 border-solid border-gray-200 px-30 py-20 text-left duration-200 hover:border-main-600 mobile:px-16';

const CardBody = ({ title, description }: ExpoAction) => (
  <>
    <div className="min-w-0 space-y-8">
      <p className="text-body1b text-black">{title}</p>
      <p className="text-caption1r text-gray-500">{description}</p>
    </div>
    <ArrowRight />
  </>
);

interface ExpoOperationsProps {
  onOpenModal: (type: string, text: string) => void;
}

/** 박람회 상세 패널(ExpoActionPanel)과 같은 운영 기능을 카드로 모은다 */
const ExpoOperations = ({ onOpenModal }: ExpoOperationsProps) => {
  const { expoId, expo } = useRegistrationExpo();
  const actions: ExpoAction[] = Object.values(getExpoActions(expoId));

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[54px]">
      <DetailHeader
        textCenter
        headerTitle={expo ? `${expo.title} 운영` : '박람회 운영'}
      />

      <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
        {actions.map((action) =>
          'href' in action ? (
            <Link key={action.title} href={action.href} className={CARD_CLASS}>
              <CardBody {...action} />
            </Link>
          ) : (
            <button
              key={action.title}
              type="button"
              onClick={() => onOpenModal(action.modal.type, action.modal.text)}
              className={CARD_CLASS}
            >
              <CardBody {...action} />
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export default ExpoOperations;
