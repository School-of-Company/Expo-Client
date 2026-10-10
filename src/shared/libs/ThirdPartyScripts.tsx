'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { usePathname } from 'next/navigation';
import ChannelTalkProvider from './ChannelTalkProvider';

// URL 쿼리에 전화번호가 담긴 페이지는 외부 스크립트로 주소가 전송되지 않게 한다
const PRIVATE_PATHS = ['/qr'];

const ThirdPartyScripts = () => {
  const pathname = usePathname();
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  const isPrivatePath = PRIVATE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (isPrivatePath) return null;

  return (
    <>
      <ChannelTalkProvider />
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </>
  );
};

export default ThirdPartyScripts;
