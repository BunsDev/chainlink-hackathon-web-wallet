import { SUPPORTED_NETWORKS } from '@/constants/chains';
import { timeout } from '@/helpers/timeout';
import { NextApiRequest, NextApiResponse } from 'next';
import { Address } from 'viem';
import { z } from 'zod';

export type MoralisResponse<T> = {
  status: string;
  page: number;
  page_size: number;
  cursor: any;
  result: MoralisResult<T>[];
};

export interface ApiResponse {
  data: MoralisResult<{ chainId: number }>[];
}

export type MoralisResult<T> = T & {
  amount: string;
  token_id: string;
  token_address: string;
  contract_type: string;
  owner_of: string;
  last_metadata_sync: string;
  last_token_uri_sync: string;
  metadata?: string;
  block_number: string;
  block_number_minted?: string;
  name: string;
  symbol: string;
  token_hash: string;
  token_uri?: string;
  minter_address?: string;
  verified_collection: boolean;
  possible_spam: boolean;
  normalized_metadata: NormalizedMetadata;
  media?: Media;
  collection_logo?: string;
  collection_banner_image?: string;
};

export interface NormalizedMetadata {
  name?: string;
  description: any;
  animation_url: any;
  external_link: any;
  image?: string;
  attributes: any[];
}

export interface Media {
  status: string;
  updatedAt: string;
  original_media_url: string;
}

const moralisUrl = 'https://deep-index.moralis.io/';
const moralisApiKey = process.env.MORALIS_API_KEY;

const bodySchema = z.object({
  address: z.string().regex(/0x[0-9a-zA-Z]{40}/),
});

export default async function getNfts(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!moralisApiKey) {
    return res.status(500).json({ message: 'Moralis API key is missing' });
  }

  const parsed = await bodySchema.safeParseAsync(req.query);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  const { address } = parsed.data;

  const urls = SUPPORTED_NETWORKS.map(({ moralisId, chain: { id } }) => {
    const url = new URL(`/api/v2.2/${address}/nft`, moralisUrl);
    url.searchParams.append('chain', moralisId);
    url.searchParams.append('format', 'decimal');
    url.searchParams.append('media_items', 'true');
    url.searchParams.append('normalizeMetadata', 'true');

    return { url, id };
  });

  const responses: MoralisResponse<{ chainId: number }>[] = [];

  for (const { url, id } of urls) {
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': moralisApiKey,
        accept: 'application/json',
      },
    });

    const data = (await response.json()) as MoralisResponse<{}>;
    const result = {
      ...data,
      result: data.result.map(
        (nft) => ({ ...nft, chainId: id }) as MoralisResult<{ chainId: number }>
      ),
    };
    responses.push(result);

    await timeout(1000);
  }

  return res.status(200).json({
    data: responses.flatMap(({ result }) => result),
  });
}
