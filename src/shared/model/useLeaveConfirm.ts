'use client';

import { useEffect } from 'react';

export const LEAVE_CONFIRM_MESSAGE =
  '지금 나가면 작성한 내용이 저장되지 않습니다. 나갈까요?';

// 지금 작성 중인 화면 수. 로그아웃처럼 코드로 화면을 옮기는 쪽이 미리 물어볼 때 쓴다
let activeCount = 0;

export const hasUnsavedChanges = () => activeCount > 0;

/**
 * 작성 중일 때 새로고침·창 닫기와 화면 안 링크 이동 전에 묻는다.
 * 새로고침·창 닫기는 브라우저 기본 경고창이라 문구를 바꿀 수 없다.
 * router.push 처럼 코드로 옮기는 이동과 브라우저 뒤로 가기는 막지 못한다
 */
export const useLeaveConfirm = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return undefined;
    activeCount += 1;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    // next/link 의 onClick 보다 먼저 받도록 document 캡처 단계에서 듣는다
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element | null)?.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      // 새 탭·다운로드는 지금 화면이 그대로 남는다
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      // 다른 사이트로 가는 링크는 beforeunload 가 묻는다
      if (url.origin !== window.location.origin) return;
      // 같은 페이지 안의 해시 이동은 작성 내용이 그대로다
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;
      if (window.confirm(LEAVE_CONFIRM_MESSAGE)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);
    return () => {
      activeCount -= 1;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [enabled]);
};
