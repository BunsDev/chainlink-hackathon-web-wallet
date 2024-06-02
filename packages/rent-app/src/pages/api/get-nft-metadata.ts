import { SUPPORTED_NETWORKS } from '@/constants/chains';
import { timeout } from '@/helpers/timeout';
import { NextApiRequest, NextApiResponse } from 'next';
import { Address } from 'viem';
import { z } from 'zod';

const bodySchema = z.object({
  tokenId: z.string(),
  tokenContract: z.string().regex(/0x[0-9a-zA-Z]{40}/),
  tokenURI: z.string(),
});

const getMockedMetadataSepolia = (id: string) => {
  return {
    description:
      'Friendly OpenSea Creature that enjoys long swims in the ocean.',
    external_url: 'https://openseacreatures.io/3',
    image: `https://storage.googleapis.com/opensea-prod.appspot.com/puffs/${id}.png`,
    name: `Polygon TT #${id}`,
  };
};

const getMockedMetadataPolygon = (id: string) => {
  return {
    description:
      'Friendly OpenSea Creature that enjoys long swims in the ocean.',
    external_url: 'https://openseacreatures.io/3',
    image: `https://storage.googleapis.com/opensea-prod.appspot.com/puffs/${id}.png`,
    name: `Sepolia TT #${id}`,
  };
};

export default async function getNfts(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const parsed = await bodySchema.safeParseAsync(req.query);

  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  const { tokenContract, tokenId, tokenURI } = parsed.data;
  if (tokenURI.includes('test-metadata-polygon')) {
    return res.status(200).json({
      data: getMockedMetadataPolygon(tokenId),
    });
  } else if (tokenURI.includes('test-metadata')) {
    return res.status(200).json({
      data: getMockedMetadataSepolia(tokenId),
    });
  } else {
    const response = await fetch(tokenURI.toString(), {
      headers: {
        accept: 'application/json',
      },
    });

    return res.status(200).json({
      data: await response.json(),
    });
  }
}
