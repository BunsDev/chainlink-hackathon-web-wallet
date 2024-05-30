import { Input } from '@/components/ui/input';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import search from '../../../assets/img/icons/search.svg';
import filter from '../../../assets/img/icons/filter.svg';
import idIcon from '../../../assets/img/icons/id.svg';
import hammer from '../../../assets/img/icons/hammer.svg';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Nft } from '@/mocks/nfts';
import { useGetNfts } from '@/hooks/queries/use-get-nfts';
import { Loader2 } from 'lucide-react';

interface DiscoverCardProps {
  nft: Nft;
}
const DiscoverCard = ({
  nft: { chainSrc, collectionName, imageSrc, nftName, price, id },
}: DiscoverCardProps) => {
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

export const Discover = () => {
  const [parent] = useAutoAnimate();
  const { data: nfts, isLoading } = useGetNfts();

  return (
    <section className="flex flex-col gap-[40px]">
      <div className="flex justify-between">
        <div className="flex flex-col gap-[8px]">
          <div className="text-[24px] leading-[32px] font-bold">Discover</div>
          <div className="text-[14px] leading-[22px] text-muted-foreground">
            151,146 items listed
          </div>
        </div>
        <div className="flex gap-[24px]">
          <div className="relative">
            <Input
              placeholder="Search NFT"
              className="py-[12px] pl-[48px] pr-[16px] bg-white border-none placeholder:text-[#A6A7CE] text-[14px] leading-[22px] rounded-[12px] w-[246px]"
            />
            <Image
              src={search}
              alt="search"
              className="absolute top-[8px] left-[16px]"
            />
          </div>

          <Select defaultValue="newest">
            <SelectTrigger className="rounded-[12px] px-[16px] py-[12px] bg-white border-none">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="text-foreground px-[16px] flex items-center gap-[8px]"
              >
                Filter
                <Image src={filter} alt="filter" />
              </Button>
            </PopoverTrigger>
          </Popover>
        </div>
      </div>
      <div className="flex flex-wrap gap-[24px] justify-between" ref={parent}>
        {isLoading || nfts === undefined ? (
          <div className="flex w-full items-center justify-center">
            <Loader2 size={64} className="animate-spin" />
          </div>
        ) : (
          nfts.map((nft) => (
            <DiscoverCard
              key={`${nft.collectionName}-${nft.nftName}`}
              nft={nft}
            />
          ))
        )}
      </div>
      <Button variant="outline" className="self-center">
        Load more
      </Button>
    </section>
  );
};
