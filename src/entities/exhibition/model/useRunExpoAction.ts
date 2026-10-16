'use client';

import { useRouter } from 'next/navigation';
import { copyExpoLink } from '../lib/copyExpoLink';
import { ExpoActionLink, ExpoActionModalType } from './expoActions';

/** 운영 기능 링크를 눌렀을 때 이동·모달 열기·링크 복사 중 하나를 한다 */
export const useRunExpoAction = (
  openModal: (type: ExpoActionModalType, text: string) => void,
) => {
  const router = useRouter();

  return (link: ExpoActionLink) => {
    if ('href' in link) router.push(link.href);
    else if ('modal' in link) openModal(link.modal.type, link.modal.text);
    else copyExpoLink(link.copy, '신청 폼 링크');
  };
};
