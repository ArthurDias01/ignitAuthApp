import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext'
import './dashboard.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <title>AuthNext</title>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp
