import '../shared/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Script from 'next/script';
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
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });

                (function() {
                  const send = () => {
                    const page_path = location.pathname + (location.search || '');
                    gtag('config', '${GA_ID}', { page_path });
                  };

                  send();

                  const wrap = (type) => {
                    const orig = history[type];
                    return function() {
                      const ret = orig.apply(this, arguments);
                      window.dispatchEvent(new Event('next-route-change'));
                      return ret;
                    }
                  };
                  history.pushState = wrap('pushState');
                  history.replaceState = wrap('replaceState');

                  window.addEventListener('popstate', send);
                  window.addEventListener('next-route-change', send);
                })();
              `}
            </Script>
          </>
        )}
      </head>
      <body className="font-Pretendard">
        <TanstackProviders>
          <ToastProvider>
            <ChannelTalkProvider />
            {children}
          </ToastProvider>
        </TanstackProviders>
      </body>
    </html>
  );
}
