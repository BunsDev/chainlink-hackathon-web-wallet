import { Check, ChevronDown, Menu } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollArea } from '../../../components/scroll-area';
import copyIcon from '../../../assets/img/icon_copy.svg';
import { Button } from '../../../components/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../../../components/dropdown';
import { cn } from '../../../lib/utils/cn';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/popover';
import { useNavigate } from 'react-router-dom';
import { UIRoutes } from '../../../lib/popup-routes';
import { useUserAccounts } from '../../hooks/read/use-user-accounts';
import { useCurrentNetwork } from '../../hooks/read/use-current-network';
import { useSwitchWallet } from '../../hooks/mutations/use-switch-wallet';
import { getAddress, isAddress } from 'ethers/lib/utils';
import { useAllNetworks } from '../../hooks/read/use-all-networks';
import { useSwitchNetwork } from '../../hooks/mutations/use-switch-network';
import { shortenAddress } from '../../../lib/utils/address';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '../../../components/dialog';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import { useImportSmartWallet } from '../../hooks/mutations/use-import-smart-wallet';
import { useDisconnectWallet } from '../../hooks/mutations/use-disconnect-wallet';

const Header = () => {
  const [networkOpened, setNetworkOpened] = useState(false);
  const { data: currentNetwork } = useCurrentNetwork();
  const { data } = useUserAccounts();
  const { data: networksData } = useAllNetworks();
  const { mutateAsync: switchNetwork } = useSwitchNetwork();
  const { mutateAsync: disconnectWallet } = useDisconnectWallet();

  const onNetworkItemClick = useCallback(
    async (i: any) => {
      let id = i?.target?.id;

      if (id === networksData?.selectedNetwork?.name) {
        return;
      }

      await switchNetwork({ switchTo: id });
    },
    [data]
  );

  const onConnectClicked = useCallback(async () => {
    if (data?.selectedAccount?.isConnected) {
      await disconnectWallet(data?.selectedAccount?.address);
    }
  }, [data]);

  return (
    <div className="py-[18px] bg-white px-[24px] items-center justify-between shadow-sm flex">
      <div className="flex items-center gap-[16px]" onClick={onConnectClicked}>
        <img src="/assets/main_logo_small.svg" alt="logo" />
        {data?.selectedAccount?.isConnected ? (
          <div className="flex items-center gap-[4px] cursor-pointer">
            <div className="bg-success rounded-full w-[8px] h-[8px]" />
            <div className="text-[12px] leading-[20px] text-success">
              Connected
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-[4px]">
            <div className="bg-error rounded-full w-[8px] h-[8px]" />
            <div className="text-[12px] leading-[20px] text-error">
              Not Connected
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-[24px] text-primary">
        <DropdownMenu open={networkOpened} onOpenChange={setNetworkOpened}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-[8px] cursor-pointer">
              <div>{currentNetwork?.name}</div>
              <div>
                <ChevronDown
                  size={16}
                  className={cn(
                    'transition-all',
                    networkOpened && 'rotate-180'
                  )}
                />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {networksData?.allNetworks?.map((s) => (
              <DropdownMenuItem
                key={s.name}
                id={s.name}
                onClick={onNetworkItemClick}
              >
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Menu size={16} className="cursor-pointer" />
      </div>
    </div>
  );
};

const SubHeader = () => {
  const { data } = useUserAccounts();
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [smartWalletSelectOpened, setSmartWalletSelectOpened] = useState(false);
  const { mutateAsync: switchWallet } = useSwitchWallet();
  const { mutateAsync: importSmartWallet } = useImportSmartWallet();
  const onSmartWalletItemClick = useCallback(
    async (i: any) => {
      let id = i?.target?.id;

      if (id === 'import-wallet') {
        const newWallet = prompt('Your smart wallet address');

        if (!newWallet || !isAddress(newWallet)) return;

        await importSmartWallet({
          address: newWallet,
          masterWallet: data?.selectedAccount?.masterWallet
            ? data?.selectedAccount?.masterWallet
            : data?.selectedAccount?.address!,
        });
      } else {
        if (id === 'no-smart-wallet') {
          id = data?.selectedAccount?.masterWallet!;
        }

        if (
          !id ||
          getAddress(id) === getAddress(data?.selectedAccount?.address!)
        ) {
          return;
        }
        await switchWallet({ switchTo: id });
      }
    },
    [data]
  );

  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[16px] border-b-[1px] border-[#1C1F5A] border-opacity-[0.08]">
      <div className="flex gap-[8px]">
        <div className="text-[12px] leading-[20px] font-medium">
          Master account:
        </div>
        <div className="text-[12px] leading-[20px] text-muted-foreground">
          {shortenAddress(
            data?.selectedAccount?.isSmartContract
              ? data?.selectedAccount?.masterWallet!
              : data?.selectedAccount?.address!
          )}
        </div>
      </div>
      <div className="flex gap-[8px]">
        {data?.selectedAccountSmartWallets?.length === 0 ? (
          <Popover open={popoverOpened} onOpenChange={setPopoverOpened}>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-[4px] cursor-pointer">
                <div className="bg-error rounded-full w-[8px] h-[8px]" />
                <div className="text-[12px] leading-[20px] text-error">
                  Not deployed
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="rounded-[4px] py-[8px] px-[16px] flex flex-col gap-[16px] border-none max-w-[290px] w-full ml-[40px]">
              <div className="flex gap-[8px]">
                <img src="/assets/icon_warning.svg" alt="warning" />
                <div className="text-[12px] leading-[20px] text-muted-foreground">
                  Your acount is not activated yet. Please generate Smart
                  Contract to activate it.
                </div>
              </div>
              <div className="flex gap-[8px]">
                <Button
                  variant="outline"
                  className="py-[4px] px-[17px] text-[16px] leading-[24px] rounded-[8px] flex-1"
                  onClick={() => setPopoverOpened(false)}
                >
                  Ask me later
                </Button>
                <Button
                  className="py-[4px] px-[17px] text-[16px] leading-[24px] rounded-[8px] flex-1"
                  onClick={() => navigate(`/${UIRoutes.generateContract.path}`)}
                >
                  Activate
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="text-[12px] leading-[20px] text-muted-foreground">
            <DropdownMenu
              open={smartWalletSelectOpened}
              onOpenChange={setSmartWalletSelectOpened}
            >
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-[8px] cursor-pointer">
                  <div>
                    {data?.selectedAccount?.isSmartContract
                      ? shortenAddress(data?.selectedAccount.address)
                      : '-'}
                  </div>
                  <div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'transition-all',
                        smartWalletSelectOpened && 'rotate-180'
                      )}
                    />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  id={'no-smart-wallet'}
                  onClick={onSmartWalletItemClick}
                >
                  -
                </DropdownMenuItem>
                {data?.selectedAccountSmartWallets?.map((s) => (
                  <DropdownMenuItem
                    key={s.address}
                    id={s.address}
                    onClick={onSmartWalletItemClick}
                  >
                    {shortenAddress(s.address)}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  id={'import-wallet'}
                  onClick={onSmartWalletItemClick}
                >
                  + Import new +
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

const Balance = () => {
  const { data } = useUserAccounts();
  const { data: currentNetwork } = useCurrentNetwork();
  const formatBalance = (balance?: string) => {
    return balance ? parseFloat(balance).toFixed(4) : '0.0000';
  };

  return (
    <div className="flex flex-col items-center gap-[16px] mt-[24px]">
      <img src="/assets/icon_ethereum.svg" alt="ethereum" />
      <div className="text-[32px] leading-[40px] font-medium">
        {formatBalance(data?.selectedAccount?.balanceNative)}{' '}
        {currentNetwork?.nativeSymbol}
      </div>
      <div className="text-[16px] leading-[24px] text-muted-foreground">
        $206.00
      </div>
    </div>
  );
};

const Main = () => {
  const items = useMemo(() => {
    return [
      {
        title: 'Account rental',
        icon: '/assets/account_rental.svg',
        onClick: () => {},
      },
      {
        title: 'NFT rental',
        icon: '/assets/nft_rental.svg',
        onClick: () => {},
      },
      {
        title: 'Account transfer',
        icon: '/assets/account_transfer.svg',
        onClick: () => {},
      },
      {
        title: 'Transaction automation',
        icon: '/assets/transaction_automation.svg',
        onClick: () => {},
      },
    ];
  }, []);

  return (
    <div className="grid grid-cols-2 gap-y-[24px] px-[24px] self-center mt-[48px] justify-items-center">
      {items.map(({ title, icon, onClick }) => (
        <div
          key={title}
          className="p-[16px] flex flex-col gap-[16px] items-center bg-white w-[170px] h-[176px] cursor-pointer"
          onClick={onClick}
        >
          <div className="text-[16px] leading-[24px] font-medium text-center">
            {title}
          </div>
          <img src={icon} alt={title} />
        </div>
      ))}
    </div>
  );
};

const Buttons = () => {
  const { data } = useUserAccounts();
  const [copied, setCopied] = useState(false);
  const value =
    (data?.selectedAccount?.isSmartContract
      ? data?.selectedAccount?.masterWallet
      : data?.selectedAccount?.address) ?? '';

  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <div className="flex items-center gap-[24px] mt-[54px] justify-center mb-[30px]">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="max-w-[170px] w-full">
            Deposit
          </Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div className="flex flex-col gap-[16px] font-sans">
            <div className="flex flex-col gap-[8px]">
              <div className="text-[20px] leading-[32px] font-bold">
                Deposit
              </div>
              <div className="text-[16px] leading-[24px] text-muted-foreground">
                Scan QR code to proceed with deposit:
              </div>
            </div>
            <div className="bg-background rounded-[13px] p-[16px] flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[4px]">
                <div className="text-[12px] leading-[20px] font-medium">
                  Address:
                </div>
                <div className="flex items-center gap-[8px]">
                  <div className="text-[14px] leading-[22px] text-muted-foreground truncate">
                    {shortenAddress(value, 7)}
                  </div>
                  {copied ? (
                    <Check className="text-primary w-[18px] h-[18px]" />
                  ) : (
                    <img
                      src={copyIcon}
                      alt="copy"
                      className="cursor-pointer"
                      onClick={onCopy}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <QRCode value={value} className="w-[156px] h-[156px]" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Button className="max-w-[170px] w-full">Transfer</Button>
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
        <Main />
        <Buttons />
      </ScrollArea>
    </div>
  );
};
