import { PropsWithChildren, memo, useState } from 'react';
import logo from '../assets/img/logo.svg';
import logoBig from '../assets/img/logo_big.svg';
import arrowDown from '../assets/img/icons/arrow_down.svg';
import Image from 'next/image';
import Link from 'next/link';
import { Sora } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { shortenAddress } from '@/helpers/address';
import { SUPPORTED_NETWORKS } from '@/constants/chains';
import { injected } from 'wagmi/connectors';
import { Loader2 } from 'lucide-react';
import { ClientOnly } from '@/components/common/client-only';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const sora = Sora({ subsets: ['latin'], display: 'swap' });

const Header = () => {
  const { address } = useAccount();
  const { connectAsync, isPending: isConnecting } = useConnect();
  const { disconnectAsync, isPending: isDisconnecting } = useDisconnect();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const onConnectClick = async () => {
    if (address) {
      await disconnectAsync();
      return;
    }

    await connectAsync({ connector: injected({ shimDisconnect: true }) });
  };

  const onChainClick = async (chainId: number) => {
    await switchChainAsync({ chainId });
  };

  return (
    <header className="bg-white w-full py-[24px]">
      <div className="container flex items-center justify-between">
        <Image src={logo} alt="logo" />
        <div className="md:flex items-center gap-[16px] hidden">
          <ClientOnly>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Image
                    src={
                      SUPPORTED_NETWORKS.find(
                        ({ chain: { id } }) => id === chainId
                      )?.icon
                    }
                    alt="bsc"
                    className="mr-[4px] w-[18px] h-[18px]"
                  />{' '}
                  {
                    SUPPORTED_NETWORKS.find(
                      ({ chain: { id } }) => id === chainId
                    )?.chain.name
                  }
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div className="flex flex-col gap-[24px]">
                  <div className="text-[16px] leading-[24px] font-medium">
                    Networks
                  </div>
                  <div className="flex flex-wrap gap-[16px]">
                    {SUPPORTED_NETWORKS.map(({ chain, icon }) => (
                      <div
                        key={chain.id}
                        className={cn(
                          'w-[133px] flex flex-col rounded-[12px] bg-background p-[16px] gap-[8px] items-center justify-center cursor-pointer trnasition-all hover:bg-[#546FFF] text-[14px] leading-[22px] font-medium hover:text-white',
                          chainId === chain.id && 'text-white bg-primary'
                        )}
                        onClick={() => onChainClick(chain.id)}
                      >
                        <Image src={icon} alt={chain.name} />
                        <div>{chain.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              disabled={isConnecting || isDisconnecting}
              onClick={onConnectClick}
              variant={address ? 'ghost' : 'default'}
            >
              {(isConnecting || isDisconnecting) && (
                <Loader2 className="mr-2 animate-spin" />
              )}
              {isConnecting || isDisconnecting
                ? 'Processing...'
                : address
                  ? shortenAddress(address)
                  : 'Connect wallet'}
            </Button>
          </ClientOnly>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="w-full bg-white py-[24px]">
      <div className="container flex flex-col gap-[24px]">
        <div className="flex flex-col md:flex-row gap-[20px] justify-between">
          <Image src={logoBig} alt="logo" />
        </div>
        <div className="text-[12px] leading-[20px]">
          &copy; {new Date().getUTCFullYear()} ProxyWallet. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export const DefaultLayout = memo(({ children }: PropsWithChildren) => {
  const [parent] = useAutoAnimate();

  return (
    <div className="flex flex-col w-full h-full gap-[72px]">
      <Header />
      <main className="flex-1">
        <div className="container flex flex-col gap-[72px]" ref={parent}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
});
DefaultLayout.displayName = 'DefaultLayout';
