import './globals.css'

export const metadata = {
  metadataBase: new URL('https://wutang.llyxx.me'),
  title: 'Wu-Tang Name Generator',
  description: 'Generate your Wu-Tang Clan name',
  openGraph: {
    images: ['/assets/wu-logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:frame" content='{"version":"next","imageUrl":"https://wutang.llyxx.me/assets/wu-logo.png","button":{"title":"Generate Wu-Tang Name","action":{"type":"launch_frame","name":"Wu-Tang Name Generator","url":"https://wutang.llyxx.me","splashImageUrl":"https://wutang.llyxx.me/assets/wu-logo.png","splashBackgroundColor":"#000"}}}' />
      </head>
      <body>{children}</body>
    </html>
  );
}
