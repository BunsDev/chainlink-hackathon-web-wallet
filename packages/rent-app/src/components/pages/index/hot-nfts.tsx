import { Button } from '@/components/ui/button';
import Image from 'next/image';
import idIcon from '../../../assets/img/icons/id.svg';
import hammer from '../../../assets/img/icons/hammer.svg';
import { useGetHotNfts } from '@/hooks/queries/use-get-hot-nfts';
import { Loader2 } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Nft } from '@/mocks/nfts';

interface HotNftProps {
  nft: Nft;
}
const HotNft = ({
  nft: { chainSrc, collectionName, imageSrc, nftName, price, id },
}: HotNftProps) => {
  return (
    <div className="w-full max-w-[300px] bg-white rounded-[12px] flex flex-col">
      <div className="relative h-[300px] w-full">
        <Image
          src={imageSrc}
          alt={nftName}
          layout="fill"
          objectFit="cover"
          className="rounded-t-[12px]"
        />
      </div>
      <div className="py-[16px] px-[24px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <div className="text-[14px] leading-[22px] text-muted-foreground">
              {collectionName}
            </div>
            <Image src={chainSrc} alt="chain" width={24} height={24} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[16px] leading-[24px] font-medium">
              {nftName}
            </div>
            <div className="flex items-center gap-[4px]">
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                {id}
              </div>
              <Image src={idIcon} alt={id} />
            </div>
          </div>
        </div>
        <div className="border-[1px] border-[#e7e8f8] w-full" />
        <div className="flex flex-col gap-[4px]">
          <div className="text-[14px] leading-[22px] text-muted-foreground">
            Current price
          </div>
          <div className="flex items-center gap-[8px]">
            <div className="text-[16px] leading-[24px] font-medium">
              {price}
            </div>
            <Image src={hammer} alt="hammer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const HotNfts = () => {
  const [parent] = useAutoAnimate();
  const { data: nfts, isLoading } = useGetHotNfts();

  return (
    <section className="flex flex-col gap-[40px]">
      <div className="flex items-center justify-between">
        <div className="text-[24px] leading-[32px] font-bold">Hot NFTs</div>
        <Button variant="secondary">View all</Button>
      </div>

      <div className="flex flex-wrap gap-[24px] justify-between" ref={parent}>
        {isLoading || nfts === undefined ? (
          <div className="flex w-full items-center justify-center">
            <Loader2 size={64} className="animate-spin" />
          </div>
        ) : (
          nfts.map((nft) => (
            <HotNft key={`${nft.collectionName}-${nft.nftName}`} nft={nft} />
          ))
        )}
      </div>
    </section>
  );
};
