import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {} from '@radix-ui/react-dropdown-menu';
import arrowUp from '../../../assets/img/icons/arrow_up.svg';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { SUPPORTED_NETWORKS } from '@/constants/chains';
import { MoralisResult } from '@/pages/api/get-nfts';
import {
  useWriteContract,
  usePublicClient,
  useChainId,
  useSwitchChain,
  useReadContract,
} from 'wagmi';
import { getContractAddresses } from '@/constants/addresses';
import { nftRentAbi } from '@/abi/NftRent';
import { Address, erc721Abi, parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

enum DurationOption {
  Minutes = 'Minutes',
  Days = 'Days',
  Weeks = 'Weeks',
}
interface SetupListProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  duration: number;
  onChangeDuration: (e: React.ChangeEvent<HTMLInputElement>) => void;
  durationOption: DurationOption;
  setDurationOption: (option: DurationOption) => void;
  fee: number;
  onChangeFee: (e: React.ChangeEvent<HTMLInputElement>) => void;
  chainSrc: any;
}
const SetupList = ({
  duration,
  durationOption,
  fee,
  onChangeDuration,
  onChangeFee,
  open,
  setDurationOption,
  setOpen,
  chainSrc,
}: SetupListProps) => {
  useEffect(() => {
    console.log(open);
  }, [open]);

  return (
    <>
      <div className="p-[16px] bg-background rounded-[10px]">
        <div className="flex items-center justify-between">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Duration
          </div>
          <div className="flex items-center bg-white rounded-[12px] gap-[8px] px-[16px] py-[8px]">
            <Input
              type="number"
              className="bg-transparent w-[54px] h-[24px] p-0 border-none text-[16px] leading-[24px] text-right !ring-0 placeholder:text-[#8E90BE]"
              placeholder="0"
              min={0}
              value={duration}
              onChange={onChangeDuration}
            />
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-[8px] rounded-[10px] px-[16px] py-[4px] text-left text-[12px] leading-[20px] h-fit bg-background text-foreground">
                  <span>{durationOption}</span>
                  <Image
                    src={arrowUp}
                    alt="arrow"
                    className={cn('transition-all', !open && 'rotate-180')}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-none rounded-[7px] bg-white p-0 w-fit">
                <DropdownMenuItem
                  onClick={() => setDurationOption(DurationOption.Minutes)}
                  className={cn(
                    'transition-all px-[16px] py-[8px] text-[12px] leading-[20px] text-foreground',
                    durationOption === DurationOption.Minutes &&
                      'bg-primary text-white hover:bg-primary hover:text-white'
                  )}
                >
                  Minutes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDurationOption(DurationOption.Days)}
                  className={cn(
                    'transition-all px-[16px] py-[8px] text-[12px] leading-[20px] text-foreground',
                    durationOption === DurationOption.Days &&
                      'bg-primary text-white hover:bg-primary hover:text-white'
                  )}
                >
                  Days
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDurationOption(DurationOption.Weeks)}
                  className={cn(
                    'transition-all px-[16px] py-[8px] text-[12px] leading-[20px] text-foreground',
                    durationOption === DurationOption.Weeks &&
                      'bg-primary text-white hover:bg-primary hover:text-white'
                  )}
                >
                  Weeks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-background rounded-[10px] p-[16px] gap-[16px]">
        <div className="text-[16px] leading-[24px] font-medium">Fee</div>
        <div className="flex items-center justify-between">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Renter pay
          </div>
          <Input
            className="text-right bg-white rounded-[12px] px-[16px] py-[8px] w-[196px] text-[16px] leading-[24px] border-none text-foreground placeholder:text-[#8E90BE]"
            placeholder="0.00"
            type="number"
            min={0}
            value={fee}
            onChange={onChangeFee}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            You receive on Default:
          </div>
          <div className="flex items-center gap-[8px]">
            <Image src={chainSrc} alt="chain" className="w-[18px] h-[18px]" />
            <div className="text-[16px] leading-[24px] font-medium">{fee}</div>
          </div>
        </div>
      </div>
    </>
  );
};

interface ReviewListProps {
  nft: MoralisResult<{ chainId: number }>;
  duration: number;
  durationOption: DurationOption;
  fee: number;
  chainSrc: any;
}
const ReviewList = ({
  nft,
  duration,
  durationOption,
  chainSrc,
  fee,
}: ReviewListProps) => {
  const [src, setSrc] = useState(
    nft.normalized_metadata.image ?? 'https://placehold.co/300x300'
  );

  return (
    <>
      <div className="rounded-[12px] w-full max-w-[432px] h-[259px] relative">
        <Image
          src={src}
          alt="nft"
          layout="fill"
          objectFit="cover"
          onError={() => setSrc('https://placehold.co/300x300')}
          className="rounded-[12px]"
        />
      </div>
      <div className="text-[24px] leading-[32px] font-bold">
        {nft.normalized_metadata.name ?? `Token #${nft.token_id}`}
      </div>
      <div className="bg-background p-[16px] gap-[16px] flex flex-col rounded-[10px]">
        <div className="text-[16px] leading-[24px] font-medium">Subtotal</div>
        <div className="flex flex-col gap-[8px]">
          <div className="flex justify-between items-center">
            <div className="text-[14px] leading-[24px] text-[#585A93]">
              Duration:
            </div>
            <div className="text-[16px] leading-[24px] font-medium">
              {duration} {durationOption}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[14px] leading-[24px] text-[#585A93]">
              Fee:
            </div>
            <div className="text-[16px] leading-[24px] font-medium flex items-center gap-[8px]">
              <Image src={chainSrc} alt="chain" className="w-[18px] h-[18px]" />
              <span>{fee}</span>
            </div>
          </div>
        </div>
        <div className="bg-[#8E90BE] w-full h-[1px]" />
        <div className="flex justify-between items-center">
          <div className="text-[16px] leading-[24px] font-medium">Total:</div>
          <div className="text-[16px] leading-[24px] font-medium flex items-center gap-[8px]">
            <Image src={chainSrc} alt="chain" className="w-[18px] h-[18px]" />
            <span>{fee}</span>
          </div>
        </div>
      </div>
    </>
  );
};

enum Tab {
  Setup = 'Setup',
  Review = 'Review',
}

interface ListNftProps {
  nft: MoralisResult<{ chainId: number }>;
  setDialogOpen: (open: boolean) => void;
}
export const ListNft = ({ nft, setDialogOpen }: ListNftProps) => {
  const [parent] = useAutoAnimate();
  const [tab, setTab] = useState(Tab.Setup);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [durationOption, setDurationOption] = useState(DurationOption.Days);
  const chainSrc = useMemo(() => {
    return SUPPORTED_NETWORKS.find(({ chain }) => chain.id === nft.chainId)
      ?.icon;
  }, [nft.chainId]);
  const [duration, setDuration] = useState(0);
  const [fee, setFee] = useState(0);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: spender, queryKey } = useReadContract({
    abi: erc721Abi,
    address: nft.token_address as Address,
    functionName: 'getApproved',
    args: [BigInt(nft.token_id)],
  });

  const isNextDisabled =
    (tab === Tab.Setup && (duration <= 0 || fee <= 0)) || isLoading;

  const onChangeDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    if (value < 0 || isNaN(value)) {
      setDuration(0);
    } else {
      setDuration(value);
    }
  };

  const onChangeFee = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    if (value < 0 || isNaN(value)) {
      setFee(0);
    } else {
      setFee(value);
    }
  };

  const onBackClick = () => {
    if (tab === Tab.Review) {
      return setTab(Tab.Setup);
    }

    setDuration(0);
    setFee(0);
    setDurationOption(DurationOption.Days);
    setOpen(false);
    setDialogOpen(false);
  };

  const onNextClick = async () => {
    if (tab === Tab.Setup) {
      return setTab(Tab.Review);
    }

    if (!publicClient) return;

    setIsLoading(true);
    if (chainId !== nft.chainId) {
      await switchChainAsync({ chainId: nft.chainId });
      return;
    }

    const durationInSeconds = BigInt(
      duration *
        (durationOption === DurationOption.Days
          ? 86400
          : durationOption === DurationOption.Minutes
            ? 60
            : 604800)
    );
    const feeInWei = parseUnits(fee.toString(), 18);

    try {
      console.log({ spender });
      if (
        spender?.toLowerCase() !==
        getContractAddresses(chainId).nftRent.toLowerCase()
      ) {
        const approveHash = await writeContractAsync({
          abi: erc721Abi,
          address: nft.token_address as Address,
          functionName: 'approve',
          args: [getContractAddresses(chainId).nftRent, BigInt(nft.token_id)],
        });

        if (approveHash) {
          console.log({ approveHash });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
          console.log('approved');
        }

        queryClient.invalidateQueries({ queryKey });
      }

      console.log('listing nft');
      const hash = await writeContractAsync({
        abi: nftRentAbi,
        address: getContractAddresses(chainId).nftRent,
        functionName: 'list',
        args: [
          nft.token_address as Address,
          BigInt(nft.token_id),
          durationInSeconds,
          feeInWei,
        ],
      });

      if (hash) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      queryClient.invalidateQueries({ queryKey: ['my-nfts'] });
      queryClient.invalidateQueries({ queryKey: ['nfts'] });
      toast.success('NFT listed successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to list NFT');
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
    }
  };

  return (
    <div ref={parent} className="flex flex-col gap-[16px] text-foreground">
      <div className="text-[20px] leading-[32px] font-bold">List NFT</div>
      {tab === Tab.Setup && (
        <SetupList
          duration={duration}
          durationOption={durationOption}
          fee={fee}
          onChangeDuration={onChangeDuration}
          onChangeFee={onChangeFee}
          open={open}
          setOpen={setOpen}
          setDurationOption={setDurationOption}
          chainSrc={chainSrc}
        />
      )}
      {tab === Tab.Review && (
        <ReviewList
          chainSrc={chainSrc}
          duration={duration}
          durationOption={durationOption}
          fee={fee}
          nft={nft}
        />
      )}
      <div className="flex items-center gap-[16px]">
        <Button variant="outline" className="flex-1" onClick={onBackClick}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={onNextClick}
          disabled={isNextDisabled}
        >
          {isLoading && <Loader2 className="mr-2 animate-spin" />}
          {isLoading
            ? 'Processing'
            : tab === Tab.Setup
              ? 'Next'
              : nft.chainId !== chainId
                ? 'Switch Network'
                : spender?.toLowerCase() !==
                    getContractAddresses(nft.chainId).nftRent.toLowerCase()
                  ? 'Approve'
                  : 'List NFT'}
        </Button>
      </div>
    </div>
  );
};
