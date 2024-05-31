import { PropsWithChildren, memo, useState } from 'react';
import logo from '../assets/img/logo.svg';
import logoBig from '../assets/img/logo_big.svg';
import arrowDown from '../assets/img/icons/arrow_down.svg';
import Image from 'next/image';
import Link from 'next/link';
import { Sora, Ubuntu } from 'next/font/google';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import bsc from '../assets/img/icons/bsc.svg';

const sora = Sora({ subsets: ['latin'], display: 'swap' });

const Header = () => {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  return (
    <header className="bg-white w-full py-[24px]">
      <div className="container flex items-center justify-between">
        <Image src={logo} alt="logo" />
        <nav className={cn('items-center hidden md:flex', sora.className)}>
          <Link
            href="/"
            className="p-[8px] text-[14px] leading-[24px] font-semibold"
          >
            Marketplace
          </Link>
          <DropdownMenu
            open={isResourcesOpen}
            onOpenChange={setIsResourcesOpen}
          >
            <DropdownMenuTrigger>
              <div className="flex items-center p-[8px] gap-[8px] text-[14px] leading-[24px] font-semibold">
                <span>Resources</span>
                <Image
                  src={arrowDown}
                  alt="arrow"
                  className={cn(
                    'transition-all',
                    isResourcesOpen && 'rotate-180'
                  )}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Item 1</DropdownMenuItem>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
              <DropdownMenuItem>Item 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="md:flex items-center gap-[16px] hidden">
          <Button variant="outline">
            <Image src={bsc} alt="bsc" className="mr-[4px]" /> BNB Chain
          </Button>
          <Button>Connect wallet</Button>
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
          <div className="flex flex-col md:flex-row w-full gap-[32px] max-w-[530px] justify-between">
            <div className="flex flex-col gap-[24px]">
              <div className="text-[16px] font-medium leading-[24px]">
                Marketplace
              </div>
              <div className="flex flex-col gap-[16px]">
                <Link
                  href="/"
                  className="text-muted-foreground text-[14px] leading-[22px]"
                >
                  Home
                </Link>
                <Link
                  href="/"
                  className="text-muted-foreground text-[14px] leading-[22px]"
                >
                  Explore
                </Link>
                <Link
                  href="/"
                  className="text-muted-foreground text-[14px] leading-[22px]"
                >
                  Activities
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-[24px]">
              <div className="text-[16px] font-medium leading-[24px]">
                Resources
              </div>
              <div className="flex flex-col gap-[16px]">
                <Link
                  href="/"
                  className="text-muted-foreground text-[14px] leading-[22px]"
                >
                  Help Center
                </Link>
                <Link
                  href="/"
                  className="text-muted-foreground text-[14px] leading-[22px]"
                >
                  FAQ
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-[24px]">
              <div className="text-[16px] font-medium leading-[24px]">
                Links
              </div>
              <div className="flex flex-col gap-[16px]">
                <Link
                  href="/"
                  className="text-muted-foreground text-[14px] leading-[22px]"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/"
                  className="text-muted-foreground text-[14px] leading-[22px]"
                >
                  Terms of Services
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[12px] leading-[20px]">
          &copy; {new Date().getUTCFullYear()} Proxywallet. All rights reserved.
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
