import { ChevronDown, Menu } from 'lucide-react';
import React from 'react';
import { ScrollArea } from '../../../components/scroll-area';

const Header = () => {
  return (
    <div className="py-[18px] bg-white px-[24px] items-center justify-between shadow-sm flex">
      <div className="flex items-center gap-[16px]">
        <img src="/assets/main_logo_small.svg" alt="logo" />
        <div className="flex items-center gap-[4px]">
          <div className="bg-success rounded-full w-[8px] h-[8px]" />
          <div className="text-[12px] leading-[20px] text-success">
            Connected
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[24px] text-primary">
        <div className="flex items-center gap-[8px] cursor-pointer">
          <div>Goerli</div>
          <div>
            <ChevronDown size={16} />
          </div>
        </div>
        <Menu size={16} className="cursor-pointer" />
      </div>
    </div>
  );
};

const SubHeader = () => {
  return (
    <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[16px] border-b-[1px] border-[#1C1F5A] border-opacity-[0.08]">
      <div className="flex gap-[8px]">
        <div className="text-[12px] leading-[20px] font-medium">
          Master account:
        </div>
        <div className="text-[12px] leading-[20px] text-muted-foreground">
          0xEa...63
        </div>
      </div>
      <div className="flex gap-[8px]">
        <div className="text-[12px] leading-[20px] font-medium">
          Smart contract:
        </div>
        <div className="text-[12px] leading-[20px] text-muted-foreground">
          0xEa...63
        </div>
      </div>
    </div>
  );
};

const Balance = () => {
  return (
    <div className="flex flex-col items-center gap-[16px] mt-[24px]">
      <img src="/assets/icon_ethereum.svg" alt="ethereum" />
      <div className="text-[32px] leading-[40px] font-medium">0.004656 ETH</div>
      <div className="text-[16px] leading-[24px] text-muted-foreground">
        $206.00
      </div>
    </div>
  );
};

export const HomePage = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <ScrollArea className="h-[540px]">
        <SubHeader />
        <Balance />
      </ScrollArea>
    </div>
  );
};
