import Document, { Html, Head, NextScript, Main } from 'next/document';


export default class MyDocuments extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />

          <body>
            <Main />
            <NextScript />
          </body>
        </Head>
      </Html>
    );
  }
}
