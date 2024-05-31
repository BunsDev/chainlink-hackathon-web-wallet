import { DefaultLayout } from '@/layouts/default-layout';
import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <DefaultLayout>
        <Component {...pageProps} />
      </DefaultLayout>
    </QueryClientProvider>
  );
}
