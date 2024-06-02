import { Button } from '@/components/ui/button';
import Image from 'next/image';
import idIcon from '../../../assets/img/icons/id.svg';
import hammer from '../../../assets/img/icons/hammer.svg';
import { useGetMyNfts } from '@/hooks/queries/use-get-my-nfts';
import { Loader2 } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { MoralisResult } from '@/pages/api/get-nfts';
import { useMemo, useState } from 'react';
import { ipfsToHttp } from '@/helpers/ipfs';
import { SUPPORTED_NETWORKS } from '@/constants/chains';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ListNft } from './list-nft';
import { useRequestUserAccountsProxyWallet } from '@/hooks/use-request-user-accounts-proxy-wallet';
import { GetRents, useGetMyRents } from '@/hooks/queries/use-get-my-rents';
import { usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import toast from 'react-hot-toast';
import { nftRentAbi } from '@/abi/NftRent';
import { getContractAddresses } from '@/constants/addresses';
import { Hex } from 'viem';
import Countdown from 'react-countdown';

interface MyNftProps {
  nft: MoralisResult<{ chainId: number }>;
  rent?: GetRents[number];
}
const MyNft = ({ nft, rent }: MyNftProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [src, setSrc] = useState(
    ipfsToHttp(nft.normalized_metadata.image) ?? 'https://placehold.co/300x300'
  );
  const [isReturning, setIsReturning] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const chainSrc = useMemo(() => {
    return SUPPORTED_NETWORKS.find(({ chain }) => chain.id === nft.chainId)
      ?.icon;
  }, [nft.chainId]);

  const onReturn = async () => {
    if (!rent || !publicClient) return;

    setIsReturning(true);

    try {
      const hash = await writeContractAsync({
        abi: nftRentAbi,
        address: getContractAddresses(nft.chainId).nftRent,
        functionName: 'returnRented',
        args: [rent.id as Hex],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success('NFT returned successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to return NFT');
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="w-full max-w-[300px] bg-white rounded-[12px] flex flex-col">
      <div className="relative h-[300px] w-full">
        <Image
          src={src}
          onError={() => setSrc('https://placehold.co/300x300')}
          alt={nft.normalized_metadata.name ?? 'nft'}
          layout="fill"
          objectFit="cover"
          className="rounded-t-[12px]"
        />
      </div>
      <div className="py-[16px] px-[24px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <div className="text-[14px] leading-[22px] text-muted-foreground">
              {nft.name}
            </div>
            <Image src={chainSrc} alt="chain" width={24} height={24} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[16px] leading-[24px] font-medium">
              {nft.normalized_metadata.name ?? `Token #${nft.token_id}`}
            </div>
          </div>
        </div>
        {rent ? (
          <div className="flex items-center gap-[24px]">
            <div className="flex flex-col gap-[4px] flex-1">
              <div className="text-[14px] leading-[22px] text-muted-foreground">
                Ends In:
              </div>
              <div className="text-[16px] leading-[24px] font-medium">
                <Countdown
                  date={new Date(parseInt(rent.rentEndsAt) * 1000)}
                  renderer={({
                    formatted: { days, hours, minutes, seconds },
                  }) => (
                    <span>
                      {days !== '00' && `${days}:`}
                      {hours}:{minutes}:{seconds}
                    </span>
                  )}
                />
              </div>
            </div>
            <Button
              disabled={isReturning}
              className="w-full flex-1"
              onClick={onReturn}
            >
              {isReturning && <Loader2 className="mr-2 animate-spin" />}
              Return
            </Button>
          </div>
        ) : (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">List NFT</Button>
            </DialogTrigger>
            <DialogContent>
              <ListNft nft={nft} setDialogOpen={setDialogOpen} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export const MyNfts = () => {
  const [parent] = useAutoAnimate();
  const { address } = useRequestUserAccountsProxyWallet();
  const { data: nfts, isLoading } = useGetMyNfts(address);
  const { data: rents, isLoading: isLoadingRents } = useGetMyRents(address);

  return (
    <section className="flex flex-col gap-[40px]">
      <div className="flex flex-col gap-[8px]">
        <div className="text-[24px] leading-[32px] font-bold">My NFTs</div>
        <div className="text-[14px] leading-[22px] text-muted-foreground">
          {nfts?.length ?? 0} items
        </div>
      </div>

      <div className="flex flex-wrap gap-[24px]" ref={parent}>
        {isLoading ||
        isLoadingRents ||
        rents === undefined ||
        nfts === undefined ? (
          <div className="flex w-full items-center justify-center">
            <Loader2 size={64} className="animate-spin" />
          </div>
        ) : (
          nfts.map((nft) => (
            <MyNft
              key={`${nft.chainId}-${nft.token_address}-${nft.token_id}`}
              nft={nft}
              rent={rents.find(
                (rent) =>
                  rent.chainId === nft.chainId &&
                  rent.list.tokenContract.toLowerCase() ===
                    nft.token_address.toLowerCase() &&
                  rent.list.tokenId.toLowerCase() === nft.token_id.toLowerCase()
              )}
            />
          ))
        )}
      </div>
    </section>
  );
};
