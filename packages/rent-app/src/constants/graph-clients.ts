import { ApolloClient, InMemoryCache } from '@apollo/client';
import { mainnet, sepolia } from 'wagmi/chains';

export const graphClients = {
  [sepolia.id]: new ApolloClient({
    uri: process.env.NEXT_PUBLIC_SEPOLIA_GRAPH_URL,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
      },
    },
  }),
};
