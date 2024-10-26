import '../shared/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import TanstackProviders from '@/shared/libs/TanstackProviders';
import ToastProvider from '@/shared/libs/ToastProvider';
import { pretendard } from '@/shared/styles/fonts';

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
