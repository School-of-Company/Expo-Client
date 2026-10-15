'use client';

import { useEffect, useRef } from 'react';
import { normalizeExpoId } from '@/shared/config';
import { recordPageView } from '../../api/recordPageView';
import { getVisitorId } from '../../lib/getVisitorId';

/** 신청화면에 들어올 때마다 한 번 조회를 기록한다. 화면에는 아무것도 그리지 않는다 */
const PageViewTracker = ({ expoId }: { expoId: string }) => {
  const recorded = useRef(false);

  useEffect(() => {
    const serverExpoId = normalizeExpoId(expoId);
    if (recorded.current || !serverExpoId) return;
    recorded.current = true;
    recordPageView(serverExpoId, getVisitorId());
  }, [expoId]);

  return null;
};

export default PageViewTracker;
