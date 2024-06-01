import { useQuery } from '@tanstack/react-query';
import { useAllNetworks } from './use-all-networks';

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const vs_currencies = 'usd';

export const usePrice = () => {
  const { data: networks } = useAllNetworks();
  const ids =
    networks?.allNetworks
      ?.map((network) => network.coingeckoId)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(',') ?? '';

  return useQuery({
    queryKey: ['price', ids],
    queryFn: async () => {
      if (!ids || !COINGECKO_API_KEY) {
        return {};
      }

      const url = new URL(COINGECKO_API);
      url.searchParams.append('ids', ids);
      url.searchParams.append('vs_currencies', vs_currencies);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'x-cg-demo-api-key': COINGECKO_API_KEY,
        },
      }).then((response) => response.json());

      return Object.entries(
        response as Record<string, Record<string, number>>
      ).reduce((acc, [id, value]) => {
        acc[id] = value[vs_currencies];
        return acc;
      }, {} as Record<string, number>);
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};
