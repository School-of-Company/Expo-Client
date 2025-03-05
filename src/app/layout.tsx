import '../shared/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
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
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-Pretendard">
        <TanstackProviders>
          <ToastProvider>{children}</ToastProvider>
        </TanstackProviders>
      </body>
    </html>
  );
}
