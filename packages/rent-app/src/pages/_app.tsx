import { DefaultLayout } from '@/layouts/default-layout';
import { config } from '@/lib/wagmi';
import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  const [client] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <title>ProxyRent</title>
      </Head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <DefaultLayout>
            <Component {...pageProps} />
            <Toaster />
          </DefaultLayout>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
