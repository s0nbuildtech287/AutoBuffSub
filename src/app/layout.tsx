import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auto Buff Sub - Hệ Thống Dịch Vụ Mạng Xã Hội Tự Động',
  description: 'Nền tảng Auto Buff Sub, Like, Follow, View mạng xã hội tự động, bảo mật và tốc độ cao',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  if (storedTheme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
