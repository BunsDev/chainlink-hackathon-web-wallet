import { Check, ChevronDown, Copy, Loader2, Menu } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollArea } from '../../../components/scroll-area';
import copyIcon from '../../../assets/img/icon_copy.svg';
import { Button, buttonVariants } from '../../../components/button';
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
import Browser from 'webextension-polyfill';
import { Input } from '../../../components/input';
import { useTransfer } from '../../hooks/mutations/use-transfer';
import { useConnectWallet } from '../../hooks/mutations/use-connect-wallet';
import { usePrice } from '../../hooks/read/use-price';

const Header = () => {
  const [networkOpened, setNetworkOpened] = useState(false);
  const { data: currentNetwork } = useCurrentNetwork();
  const { data } = useUserAccounts();
  const { data: networksData } = useAllNetworks();
  const { mutateAsync: switchNetwork } = useSwitchNetwork();
  const { mutateAsync: disconnectWallet } = useDisconnectWallet();
  const { mutateAsync: connectWallet } = useConnectWallet();

  const onNetworkItemClick = useCallback(
    async (i: any) => {
      let id = i?.target?.id;

      if (id === networksData?.selectedNetwork?.name) {
        return;
      }

      try {
        await switchNetwork({ switchTo: id });
      } catch (e) {
        toast.error('Failed to switch network. Try again later.');
        console.error(e);
      }
    },
    [networksData, switchNetwork]
  );

  const onConnectClicked = useCallback(async () => {
    if (!data?.selectedAccount) return;

    if (data.selectedAccount.isConnected) {
      await disconnectWallet(data.selectedAccount.address);
    } else {
      await connectWallet(data.selectedAccount.address);
    }
  }, [data, disconnectWallet]);

  return (
    <div className="py-[8px] bg-white px-[24px] items-center justify-between shadow-sm flex">
      <div className="flex items-center gap-[16px]" onClick={onConnectClicked}>
        {data?.selectedAccount?.isConnected ? (
          <div className="flex items-center gap-[4px] cursor-pointer">
            <div className="bg-success rounded-full w-[8px] h-[8px]" />
          </div>
        ) : (
          <div className="flex items-center gap-[4px]">
            <div className="bg-error rounded-full w-[8px] h-[8px]" />
          </div>
        )}
        {/* <img src="/assets/main_logo_small.svg" alt="logo" /> */}
        <div className="text-[16px] font-medium leading-[24px]">
          ProxyWallet
        </div>
      </div>
      <div className="flex items-center gap-[24px] text-primary">
        <Dialog open={networkOpened} onOpenChange={setNetworkOpened}>
          <DialogTrigger asChild>
            <div className="flex border px-[16px] py-[8px] border-primary text-primary rounded-[12px] items-center hover:bg-accent transition-all cursor-pointer">
              {currentNetwork?.image && (
                <img
                  src={currentNetwork?.image}
                  alt="network"
                  className="w-[18px] h-[18px]"
                />
              )}
              <div className="text-[12px] leading-[20px]">
                {currentNetwork?.name}
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-[24px]">
              <div className="text-[16px] leading-[24px] font-medium">
                Networks
              </div>
              <div className="grid grid-cols-2 gap-[16px]">
                {networksData?.allNetworks?.map((s) => (
                  <div
                    key={s.name}
                    id={s.name}
                    className={cn(
                      'cursor-pointer w-full py-[8px] px-[16px] flex items-center gap-[8px] bg-background rounded-[12px] text-[14px] leading-[22px] text-foreground hover:bg-[#546FFF] hover:text-white transition-all',
                      currentNetwork?.chainId === s.chainId &&
                        'bg-primary text-white'
                    )}
                    onClick={onNetworkItemClick}
                  >
                    <img
                      src={s.image}
                      alt="network"
                      className="w-[32px] h-[32px]"
                    />
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Menu size={16} className="cursor-pointer" />
      </div>
    </div>
  );
};

const SubHeader = () => {
  const { data } = useUserAccounts();
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [masterCopied, setMasterCopied] = useState(false);
  const [scCopied, setScCopied] = useState(false);
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
    [data, importSmartWallet, switchWallet]
  );

  const onMasterCopy = () => {
    navigator.clipboard.writeText(
      data?.selectedAccount?.isSmartContract
        ? data?.selectedAccount?.masterWallet!
        : data?.selectedAccount?.address!
    );
    setMasterCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => {
      setMasterCopied(false);
    }, 3000);
  };

  const onScCopy = () => {
    navigator.clipboard.writeText(
      data?.selectedAccount?.isSmartContract
        ? data?.selectedAccount.address
        : '-'
    );
    setScCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => {
      setScCopied(false);
    }, 3000);
  };

  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-[24px] pt-[16px] pb-[6px] border-b-[1px] border-[#1C1F5A] border-opacity-[0.08]">
      <div className="flex flex-col gap-[2px]">
        <div className="text-[12px] leading-[20px] font-medium opacity-80">
          Master account:
        </div>
        <div className="flex items-center gap-[8px]">
          <div className="text-[12px] leading-[20px] text-muted-foreground">
            {shortenAddress(
              data?.selectedAccount?.isSmartContract
                ? data?.selectedAccount?.masterWallet!
                : data?.selectedAccount?.address!
            )}
          </div>
          {masterCopied ? (
            <Check size={18} className="text-primary" />
          ) : (
            <img
              src={copyIcon}
              alt="copy"
              onClick={onMasterCopy}
              className="cursor-pointer"
            />
          )}
        </div>
      </div>
      <div className="flex gap-[8px]">
        {data?.selectedAccountSmartWallets?.length === 0 ? (
          <Popover open={popoverOpened} onOpenChange={setPopoverOpened}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="py-[8px] px-[16px] rounded-[12px] text-[12px] leading-[20px] text-primary"
              >
                Generate Smart Contract
              </Button>
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
              <div className="flex flex-col gap-[2px]">
                <div className="text-[12px] leading-[20px] font-medium opacity-80 text-right">
                  Smart Contract:
                </div>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center justify-end gap-[8px] cursor-pointer">
                    <div>
                      {data?.selectedAccount?.isSmartContract
                        ? shortenAddress(data?.selectedAccount.address)
                        : '-'}
                    </div>
                    {data?.selectedAccount?.isSmartContract ? (
                      scCopied ? (
                        <Check size={18} className="text-primary" />
                      ) : (
                        <img
                          src={copyIcon}
                          alt="copy"
                          onClick={(e) => {
                            e.preventDefault();
                            onScCopy();
                          }}
                          className="cursor-pointer"
                        />
                      )
                    ) : null}
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
              </div>

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
  const { data: prices } = usePrice();

  const { balance, balanceUsd } = useMemo(() => {
    const balance = parseFloat(data?.selectedAccount?.balanceNative ?? '0');
    const price = prices?.[currentNetwork?.coingeckoId ?? ''] ?? 0;

    return {
      balance: `${balance.toFixed(4)} ${currentNetwork?.nativeSymbol}`,
      balanceUsd: `$${(balance * price).toFixed(2)}`,
    };
  }, [data, currentNetwork, prices]);

  return (
    <div className="flex flex-col items-center gap-[8px] mt-[34px]">
      <div className="flex items-center gap-[8px] justify-center">
        <img src="/assets/icon_ethereum.svg" alt="ethereum" />
        <div className="text-[24px] leading-[32px] font-bold">{balance}</div>
      </div>

      <div className="text-[14px] leading-[22px] text-muted-foreground">
        {balanceUsd}
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
        onClick: () =>
          Browser.tabs.create({ url: 'https://proxy-rent.netlify.app' }),
      },
      {
        title: 'Account transfer',
        icon: '/assets/account_transfer.svg',
        onClick: () => {},
      },
      // {
      //   title: 'Transaction automation',
      //   icon: '/assets/transaction_automation.svg',
      //   onClick: () => {},
      // },
    ];
  }, []);

  return (
    <div className="grid grid-cols-2 gap-[8px] px-[24px] self-center mt-[40px] justify-items-center">
      {items.map(({ title, icon, onClick }) => (
        <div
          key={title}
          className="p-[16px] flex flex-col gap-[8px] items-center bg-white w-[192px] h-[110px] cursor-pointer hover:bg-[#546FFF] rounded-[8px] transition-all hover:text-white"
          onClick={onClick}
        >
          <div className="text-[14px] leading-[22px] font-medium text-center">
            {title}
          </div>
          <img src={icon} alt={title} />
        </div>
      ))}
    </div>
  );
};

const Transfer = () => {
  const [amount, setAmount] = useState(0);
  const [address, setAddress] = useState('');
  const [opened, setOpened] = useState(false);
  const { mutateAsync: transfer, isPending } = useTransfer();

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    if (value < 0 || isNaN(value)) {
      return;
    }

    setAmount(value);
  };

  const onTransfer = async () => {
    let parsedAddress = '';
    try {
      parsedAddress = getAddress(address);
    } catch (e) {
      toast.error('Invalid address');
      return;
    }

    if (amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    try {
      await transfer({ address: parsedAddress, amount });
      toast.success('Transfer successful');
    } catch (e) {
      toast.error('Transfer failed');
    }
  };

  return (
    <Dialog open={opened} onOpenChange={setOpened}>
      <DialogTrigger asChild>
        <Button className="max-w-[170px] w-full">Transfer</Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col gap-[24px] font-sans">
          <div className="flex flex-col gap-[8px]">
            <div className="text-[20px] leading-[32px] font-bold">Transfer</div>
            <div className="text-[16px] leading-[24px] text-muted-foreground">
              Fill in the following details:
            </div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[4px]">
              <div className="text-[14px] leading-[24px]">Enter amount</div>
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                onChange={onAmountChange}
                className="px-[16px] py-[12px] rounded-[12px] bg-background text-[16px] leading-[24px] placeholder:text-[#8e90be] text-foreground"
              />
            </div>
            <div className="flex flex-col gap-[4px]">
              <div className="text-[14px] leading-[24px]">Enter address</div>
              <Input
                min={0}
                step={0.01}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter public address (0x)"
                className="px-[16px] py-[12px] rounded-[12px] bg-background text-[16px] leading-[24px] placeholder:text-[#8e90be] text-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-[16px]">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setOpened(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={isPending}
              onClick={onTransfer}
            >
              {isPending && <Loader2 className="mr-2" />}Transfer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface DepositProps {
  value: string;
}
const Deposit = ({ value }: DepositProps) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
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
            <div className="text-[20px] leading-[32px] font-bold">Deposit</div>
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
  );
};

const Buttons = () => {
  const { data } = useUserAccounts();

  const value = data?.selectedAccount?.address ?? '';

  return (
    <div className="flex items-center gap-[24px] mt-[54px] justify-center mb-[30px]">
      <Deposit value={value} />
      <Transfer />
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
