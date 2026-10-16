'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// 모달 위에 모달이 열리면 가장 위의 것만 키보드를 처리한다
const openDialogs: HTMLElement[] = [];

const getFocusable = (dialog: HTMLElement) =>
  Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.getClientRects().length > 0,
  );

interface Options {
  /** 없으면 Escape 로 닫지 않는다 */
  onClose?: () => void;
  /** 발송·다운로드 중처럼 닫으면 안 되는 동안 false */
  canClose?: boolean;
}

/**
 * 모달 대화상자의 키보드 조작. 열리면 대화상자 자체로 포커스를 옮기고(발송·삭제 버튼을 기본 포커스로 두지 않는다),
 * Tab·Shift+Tab 을 안에 가두고, Escape 로 닫고, 닫히면 연 버튼으로 포커스를 돌린다. 열린 동안 배경 스크롤을 막는다.
 * 돌려준 ref 를 role="dialog" 요소에 붙이고 그 요소에 tabIndex={-1} 을 준다.
 */
export const useModalDialog = <T extends HTMLElement = HTMLDivElement>({
  onClose,
  canClose = true,
}: Options = {}) => {
  const ref = useRef<T>(null);
  const closeRef = useRef({ onClose, canClose });
  closeRef.current = { onClose, canClose };

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;

    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    openDialogs.push(dialog);
    dialog.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (openDialogs[openDialogs.length - 1] !== dialog) return;

      if (event.key === 'Escape') {
        const { onClose: close, canClose: closable } = closeRef.current;
        if (close && closable) {
          event.preventDefault();
          close();
        }
        return;
      }
      if (event.key !== 'Tab') return;

      const items = getFocusable(dialog);
      const active = document.activeElement;
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const isOutside = !(active instanceof Node) || !dialog.contains(active);
      if (
        event.shiftKey &&
        (active === first || active === dialog || isOutside)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || isOutside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      openDialogs.splice(openDialogs.indexOf(dialog), 1);
      document.body.style.overflow = previousOverflow;
      // 연 버튼이 아직 화면에 있으면 그리로 돌아간다
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  return ref;
};
