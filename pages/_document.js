import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b0f14" />
        <meta name="description" content="CutWise: cook grass-fed, grass-finished beef cuts with confidence." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
