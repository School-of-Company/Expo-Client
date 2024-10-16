import TanstackProviders from '@/libs/TanstackProviders';
import ToastProvider from '@/libs/ToastProvider';
import { pretendard } from '@/styles/fonts';
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

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
