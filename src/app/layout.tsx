import '../shared/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import ChannelTalkProvider from '@/shared/libs/ChannelTalkProvider';
import TanstackProviders from '@/shared/libs/TanstackProviders';
import ToastProvider from '@/shared/libs/ToastProvider';
import { pretendard } from '@/shared/styles/fonts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Expo',
    template: '%s | Expo',
  },
  description: 'Expo는 박람회를 관리하는 서비스입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-Pretendard">
        <TanstackProviders>
          <ToastProvider>
            <ChannelTalkProvider />
            {children}
          </ToastProvider>
        </TanstackProviders>
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
