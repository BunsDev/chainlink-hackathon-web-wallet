import { Input } from '@/components/ui/input';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import search from '../../../assets/img/icons/search.svg';
import filter from '../../../assets/img/icons/filter.svg';
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
import { UseGetNftsReturnType, useGetNfts } from '@/hooks/queries/use-get-nfts';
import { Loader2 } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { shortenAddress } from '@/helpers/address';
import {
  Address,
  Hex,
  encodePacked,
  formatUnits,
  getAddress,
  keccak256,
  parseUnits,
  toHex,
} from 'viem';
import { SUPPORTED_NETWORKS } from '@/constants/chains';
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useWriteContract,
} from 'wagmi';
import { ClientOnly } from '@/components/common/client-only';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { nftRentAbi } from '@/abi/NftRent';
import { getAddresses } from 'viem/actions';
import { getContractAddresses } from '@/constants/addresses';
import { hash } from '@/helpers/crypto';
import { smartWalletFactoryV1Abi } from '@/abi/SmartWalletFactoryV1';
import toast from 'react-hot-toast';

type Nft = UseGetNftsReturnType[number]['data']['lists'][number];
interface DiscoverCardProps {
  nft: Nft;
  chainId: number;
}
const DiscoverCard = ({
  nft: { tokenId, tokenContract, rentDuration, ethFee },
  chainId,
}: DiscoverCardProps) => {
  const [parent] = useAutoAnimate();
  const { isConnected, address } = useAccount();
  const [imageSrc, setImageSrc] = useState('https://placehold.co/300x300');
  const { chainSrc, symbol } = useMemo(() => {
    return {
      chainSrc: SUPPORTED_NETWORKS.find(({ chain }) => chain.id === chainId)
        ?.icon,
      symbol: SUPPORTED_NETWORKS.find(({ chain }) => chain.id === chainId)
        ?.chain.nativeCurrency.symbol,
    };
  }, [chainId]);
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const onRentNft = async () => {
    if (!address || isLoading || !walletClient || !publicClient) return;

    setIsLoading(true);
    try {
      const seed = new Date().getTime().toString();
      const hashedSeed = hash(seed);
      const salt = keccak256(
        encodePacked(['address', 'string'], [address, hashedSeed]),
        'hex'
      );
      const deploymentAddress = await publicClient.readContract({
        abi: smartWalletFactoryV1Abi,
        address: getContractAddresses(chainId).smartWalletFactory,
        functionName: 'predictCreate2Wallet',
        args: [address, salt],
      });

      const txHash = await writeContractAsync({
        abi: nftRentAbi,
        address: getContractAddresses(chainId).nftRent,
        functionName: 'rent',
        args: [keccak256(encodePacked(['string'], [salt]))],
        value: BigInt(ethFee) + parseUnits('0.01', 18),
        gas: BigInt(100_000),
      });
      if (txHash) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }
      toast.success('NFT rented successfully');
      const proxyWalletClient = walletClient.extend((client) => ({
        async importSmartAccount(args: { address: Address }) {
          return client.request({
            // @ts-expect-error this method is not standard
            method: 'wallet_ImportSmartWallet',
            params: [args.address],
          });
        },
      }));
      await proxyWalletClient.importSmartAccount({
        address: deploymentAddress,
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to rent NFT');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[300px] bg-white rounded-[12px] flex flex-col">
      <div className="relative h-[300px] w-full">
        <Image
          src={imageSrc}
          alt={tokenId}
          onError={() => setImageSrc('https://placehold.co/300x300')}
          layout="fill"
          objectFit="cover"
          fill
          className="rounded-t-[12px]"
        />
      </div>
      <div className="py-[16px] px-[24px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <div className="text-[14px] leading-[22px] text-muted-foreground">
              {shortenAddress(getAddress(tokenContract))}
            </div>
            <Image src={chainSrc} alt="chain" width={24} height={24} />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[16px] leading-[24px] font-medium">
              Token #{tokenId}
            </div>
          </div>
        </div>
        <div className="border-[1px] border-[#e7e8f8] w-full" />
        <div className="flex items-center justify-between" ref={parent}>
          <div className="flex flex-col gap-[4px]">
            <div className="text-[14px] leading-[22px] text-muted-foreground">
              Fee
            </div>
            <div className="flex items-center gap-[8px]">
              <div className="text-[16px] leading-[24px] font-medium">
                {formatUnits(BigInt(ethFee), 18)} {symbol}
              </div>
              <Image src={hammer} alt="hammer" />
            </div>
          </div>
          <ClientOnly>
            {isConnected && (
              <Dialog>
                <DialogTrigger>
                  <Button>Rent NFT</Button>
                </DialogTrigger>
                <DialogContent className="rounded-[12px] p-[24px] gap-[16px] flex flex-col w-full max-w-[400px]">
                  <div className="text-[20px] leading-[32px] font-bold">
                    Token #{tokenId}
                  </div>
                  <div className="rounded-[12px] relative w-[330px] h-[260px]">
                    <Image
                      src={imageSrc}
                      alt={tokenId}
                      onError={() =>
                        setImageSrc('https://placehold.co/300x300')
                      }
                      layout="fill"
                      objectFit="cover"
                      className="rounded-[12px] w-[330px] h-[260px]"
                    />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <div className="text-[14px] leading-[22px] text-muted-foreground">
                      Owner
                    </div>
                    <div className="text-[16px] leading-[24px] font-medium">
                      {shortenAddress(getAddress(tokenContract))}
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-[#E7E8F8]" />
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[4px]">
                      <div className="text-[14px] leading-[22px] text-muted-foreground">
                        Fee
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <div className="text-[16px] leading-[24px] font-medium">
                          {formatUnits(BigInt(ethFee), 18)} {symbol}
                        </div>
                        <Image src={hammer} alt="hammer" />
                      </div>
                    </div>
                    <Button disabled={isLoading} onClick={onRentNft}>
                      {isLoading && <Loader2 className="mr-2 animate-spin" />}
                      Rent NFT
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </ClientOnly>
        </div>
      </div>
    </div>
  );
};

export const Discover = () => {
  const [parent] = useAutoAnimate();
  const { data: nfts, isLoading } = useGetNfts();
  const totalLength = useMemo(() => {
    return nfts?.reduce((acc, curr) => acc + curr.data.lists.length, 0);
  }, [nfts]);
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);
  const [contragetAddress, setContragentAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [filterConragentAddress, setFilterConragentAddress] = useState('');
  const [filterContractAddress, setFilterContractAddress] = useState('');
  const [open, setOpen] = useState(false);

  const renderedNfts = useMemo(() => {
    if (!nfts) return [];
    return nfts
      .flatMap((nft) => {
        const items = nft.data.lists.map((item) => ({
          nft: item,
          chainId: nft.chainId,
        }));

        return items;
      })
      .filter(
        ({ nft }) =>
          (nft.tokenContract
            .toLowerCase()
            .includes(deferredSearchValue.toLowerCase()) ||
            nft.tokenId.toString().includes(deferredSearchValue)) &&
          (!!filterConragentAddress
            ? nft.owner
                .toLowerCase()
                .includes(filterConragentAddress.toLowerCase())
            : true) &&
          (!!filterContractAddress
            ? nft.tokenContract
                .toLowerCase()
                .includes(filterContractAddress.toLowerCase())
            : true)
      );
  }, [
    nfts,
    deferredSearchValue,
    filterConragentAddress,
    filterContractAddress,
  ]);

  const onReset = () => {
    setContragentAddress('');
    setContractAddress('');
    setFilterConragentAddress('');
    setFilterContractAddress('');
    setOpen(false);
  };

  const onApply = () => {
    setFilterConragentAddress(contragetAddress);
    setFilterContractAddress(contractAddress);
    setOpen(false);
  };

  return (
    <section className="flex flex-col gap-[40px]">
      <div className="flex justify-between">
        <div className="flex flex-col gap-[8px]">
          <div className="text-[24px] leading-[32px] font-bold">Discover</div>
          <div className="text-[14px] leading-[22px] text-muted-foreground">
            {totalLength} items listed
          </div>
        </div>
        <div className="flex gap-[24px]">
          <div className="relative">
            <Input
              placeholder="Search NFT"
              className="py-[12px] pl-[48px] pr-[16px] bg-white border-none placeholder:text-[#A6A7CE] text-[14px] leading-[22px] rounded-[12px] w-[246px]"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="text-foreground px-[16px] flex items-center gap-[8px]"
              >
                Filter
                <Image src={filter} alt="filter" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="flex flex-col gap-[24px]">
                <div className="text-[20px] leading-[32px] font-bold">
                  Filters
                </div>
                <div className="flex flex-col gap-[8px]">
                  <div className="text-[14px] leading-[22px]">
                    Contragent address
                  </div>
                  <Input
                    placeholder="Enter address"
                    className="rounded-[12px] px-[16px] py-[12px] bg-background text-[16px] leading-[24px] placeholder:text-[#8E90BE] text-foreground border-none"
                    value={contragetAddress}
                    onChange={(e) => setContragentAddress(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <div className="text-[14px] leading-[22px]">
                    Contract address
                  </div>
                  <Input
                    placeholder="Enter contract address"
                    className="rounded-[12px] px-[16px] py-[12px] bg-background text-[16px] leading-[24px] placeholder:text-[#8E90BE] text-foreground border-none"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-[16px]">
                <Button variant="outline" className="flex-1" onClick={onReset}>
                  Reset
                </Button>
                <Button className="flex-1" onClick={onApply}>
                  Apply
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex flex-wrap gap-[24px]" ref={parent}>
        {isLoading || nfts === undefined ? (
          <div className="flex w-full items-center justify-center">
            <Loader2 size={64} className="animate-spin" />
          </div>
        ) : (
          renderedNfts.map(({ nft, chainId }) => (
            <DiscoverCard
              key={`${chainId}-${nft.tokenContract}-${nft.tokenId}`}
              nft={nft}
              chainId={chainId}
            />
          ))
        )}
      </div>
    </section>
  );
};
