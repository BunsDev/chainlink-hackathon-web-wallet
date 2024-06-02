import React, { useContext, useState, useEffect, useCallback } from 'react';
import Browser, { runtime } from 'webextension-polyfill';
import { getCustomError, getError } from '../../../lib/errors';
import {
  newPopupOnMessage,
  sendRuntimeMessageToBackground,
} from '../../../lib/message-bridge/bridge';
import {
  PostMessageDestination,
  RuntimePostMessagePayload,
  RuntimePostMessagePayloadType,
} from '../../../lib/message-bridge/types';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { GetAccountsDTO } from '../../../lib/providers/background/methods/internal/getUserAddresses';
import { ErrorCodes, EthereumRequest } from '../../../lib/providers/types';
import { Context } from '../../Context';
import { Marketplace__factory } from '../../testContractFactory/Marketplace__factory';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BigNumber, utils } from 'ethers';
import { usePagePromise } from '../../hooks/usePagePromise';
import { PromisePageProps } from '../../types';
import { formatUnits } from 'ethers/lib/utils';
import { cn } from '../../../lib/utils/cn';
import { ScrollArea } from '../../../components/scroll-area';
import { Button } from '../../../components/button';
import { SendTransactionRequestDTO } from '../../../lib/providers/background/methods/external/eth_sendTransaction';
import payment from '../../../assets/img/icon_payment.svg';
import calendar from '../../../assets/img/icon_calendar.svg';
import arrowRightCircle from '../../../assets/img/icon_arrow_right_circle.svg';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/popover';
import { format } from 'date-fns';
import { Calendar } from '../../../components/calendar';
import { Input } from '../../../components/input';
import { useUserAccounts } from '../../hooks/read/use-user-accounts';
import { useConvertTxToAutoExecute } from '../../hooks/mutations/use-convert-tx-to-auto-execute';
import { shortenAddress } from '../../../lib/utils/address';
import { useCurrentNetwork } from '../../hooks/read/use-current-network';
import { usePrice } from '../../hooks/read/use-price';
import toast from 'react-hot-toast';

enum Tab {
  Details = 'Details',
  Data = 'Data',
}

type SendTransactionPageProps = {
  tx?: SendTransactionRequestDTO;
} & PromisePageProps<SendTransactionRequestDTO>;

const SendTransactionPage: React.FC<SendTransactionPageProps> = ({
  runtimeListen = false,
  tx,
  onRejectCallback,
  onResolveCallback,
}) => {
  const [tab, setTab] = useState(Tab.Details);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [originalTx, setOriginalTx] = useState<SendTransactionRequestDTO>();
  const [txToSign, setTxToSign] = useState<SendTransactionRequestDTO>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [autoOpened, setAutoOpened] = useState<boolean>(false);
  const { data } = useUserAccounts();
  const { mutateAsync: convertTxToAutoExecute } = useConvertTxToAutoExecute();
  const { data: currentNetwork } = useCurrentNetwork();
  const connectedAddress = (data?.connectedAccount ?? data?.selectedAccount)
    ?.address;
  const { data: prices } = usePrice();

  const onSaveAutoPaymentClick = useCallback(async () => {
    if (!originalTx) return;

    if (!date) {
      setTxToSign(originalTx);
      setAutoOpened(false);
      return;
    }

    const hours = parseInt(time?.split(':')[0] ?? '0');
    const minutes = parseInt(time?.split(':')[1] ?? '0');
    const seconds = hours * 60 * 60 + minutes * 60;
    const executeAfter = Math.floor(date.getTime() / 1000) + seconds;
    if (executeAfter < Math.floor(Date.now() / 1000)) {
      setTxToSign(originalTx);
      toast.error('Date and time should be in the future.');
      return;
    }
    const autoSendTx = await convertTxToAutoExecute({
      ...originalTx,
      executeAfter,
    });

    setTxToSign(autoSendTx);
    setAutoOpened(false);
  }, [originalTx, date, time, convertTxToAutoExecute]);

  const [pagePromise, pagePromiseFunctions] =
    usePagePromise<SendTransactionRequestDTO>();

  const discardTx = () => {
    pagePromiseFunctions?.reject?.(getError(ErrorCodes.userRejected));
  };

  const approveTx = () => {
    if (txToSign) pagePromiseFunctions.resolve?.(txToSign);
  };

  const onTabMessage = useCallback(
    async (
      req: RuntimePostMessagePayload<EthereumRequest<SendTransactionRequestDTO>>
    ) => {
      if (!req.msg || !req.msg.params || !req.msg.params.length) {
        const err = getCustomError('Invalid payload');
        pagePromiseFunctions?.reject?.(err);
        throw err;
      }

      const [tx] = req.msg.params;

      setTxToSign(tx);
      setOriginalTx(tx);
      setIsLoaded(true);
      return pagePromise;
    },
    [pagePromise, pagePromiseFunctions]
  );

  useEffect(() => {
    if (runtimeListen && !tx) {
      newPopupOnMessage<
        SendTransactionRequestDTO,
        EthereumRequest<SendTransactionRequestDTO>
      >(onTabMessage);

      return () => {
        Browser.runtime.onMessage.removeListener(onTabMessage);
      };
    } else {
      onTabMessage(
        new RuntimePostMessagePayload({
          destination: PostMessageDestination.NEW_POPUP,
          type: RuntimePostMessagePayloadType.EXTERNAL,
          msg: {
            method: 'eth_sendTransaction',
            params: [tx],
          } as EthereumRequest<SendTransactionRequestDTO>,
        })
      )
        .then(onResolveCallback ?? (() => {}))
        .catch(onRejectCallback ?? (() => {}));
    }
  }, [onRejectCallback, onResolveCallback, onTabMessage, runtimeListen, tx]);

  return (
    <div className="p-[24px] flex flex-col h-full">
      <div className="text-[24px] leading-[32px] font-bold">
        Confirm transaction
      </div>
      <div className="mt-[24px] bg-white rounded-[12px] p-[16px] flex flex-col gap-[16px]">
        <div className="flex items-center rounded-[9px] p-[8px] gap-[24px] bg-background text-foreground justify-between">
          <div className="flex flex-col gap-[2px]">
            <div className="text-[12px] font-medium leading-[20px] opacity-80">
              From:
            </div>
            <div className="text-[12px] leading-[20px] text-muted-foreground">
              {connectedAddress ? shortenAddress(connectedAddress, 5) : ''}
            </div>
          </div>
          <img src={arrowRightCircle} alt="arrowRightCircle" />
          <div className="flex flex-col gap-[2px]">
            <div className="text-[12px] font-medium leading-[20px] opacity-80">
              To:
            </div>
            <div className="text-[12px] leading-[20px] text-muted-foreground">
              {txToSign?.to ? shortenAddress(txToSign?.to, 5) : ''}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <div className="text-[12px] leading-[20px] text-muted-foreground opacity-80 font-medium">
              Value
            </div>
            <div className="text-[16px] font-medium leading-[24px]">
              {parseFloat(
                formatUnits(BigNumber.from(txToSign?.value ?? 0))
              ).toFixed(4)}{' '}
              {currentNetwork?.nativeSymbol}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[12px] leading-[20px] text-muted-foreground opacity-80 font-medium">
              {txToSign?.isContractWalletDeployment
                ? 'Wallet deployment'
                : 'Contract interaction'}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="mt-[24px] rounded-[16px] p-[16px] bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[16px]">
              <div
                className={cn(
                  'text-[14px] leading-[20px] border-b-[2px] border-b-transparent text-muted-foreground cursor-pointer',
                  tab === Tab.Details &&
                    'font-bold text-primary border-b-primary'
                )}
                onClick={() => setTab(Tab.Details)}
              >
                Details
              </div>
              <div
                className={cn(
                  'text-[14px] leading-[20px] border-b-[2px] border-b-transparent text-muted-foreground cursor-pointer',
                  tab === Tab.Data && 'font-bold text-primary border-b-primary'
                )}
                onClick={() => setTab(Tab.Data)}
              >
                Data
              </div>
            </div>
            {/* <img src="/assets/icon_edit.svg" alt="icon_edit" /> */}
          </div>
          {tab === Tab.Details ? (
            <div className="mt-[16px] grid grid-cols-[auto_1fr] gap-[8px]">
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Gas Limit:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {BigNumber.from(txToSign?.gasLimit ?? 0)?.toString()}
              </div>
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Gas Price:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {parseFloat(
                  formatUnits(BigNumber.from(txToSign?.gasPrice ?? 0), 'gwei')
                ).toFixed(6)}{' '}
                gwei
              </div>
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Total Gas:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {parseFloat(
                  formatUnits(
                    BigNumber.from(txToSign?.gasLimit ?? 0).mul(
                      BigNumber.from(txToSign?.gasPrice ?? 0)
                    )
                  )
                ).toFixed(6)}{' '}
                {currentNetwork?.nativeSymbol}{' '}
                <span className="text-[14px] leading-[24px] text-muted-foreground font-normal">
                  ($
                  {(
                    parseFloat(
                      formatUnits(
                        BigNumber.from(txToSign?.gasLimit ?? 0).mul(
                          BigNumber.from(txToSign?.gasPrice ?? 0)
                        )
                      )
                    ) * (prices?.[currentNetwork?.coingeckoId ?? ''] ?? 0)
                  ).toFixed(2)}
                  )
                </span>
              </div>
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Total Cost:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {parseFloat(
                  formatUnits(
                    BigNumber.from(txToSign?.gasLimit ?? 0)
                      .mul(BigNumber.from(txToSign?.gasPrice ?? 0))
                      .add(BigNumber.from(txToSign?.value ?? 0))
                  )
                ).toFixed(6)}{' '}
                {currentNetwork?.nativeSymbol}{' '}
                <span className="text-[14px] leading-[24px] text-muted-foreground font-normal">
                  ($
                  {(
                    parseFloat(
                      formatUnits(
                        BigNumber.from(txToSign?.gasLimit ?? 0)
                          .mul(BigNumber.from(txToSign?.gasPrice ?? 0))
                          .add(BigNumber.from(txToSign?.value ?? 0))
                      )
                    ) * (prices?.[currentNetwork?.coingeckoId ?? ''] ?? 0)
                  ).toFixed(2)}
                  )
                </span>
              </div>
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Chain:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {currentNetwork?.name}
              </div>
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Nonce:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {txToSign?.nonce?.toString()}
              </div>

              {!!txToSign?.executeAfter && (
                <>
                  <div className="text-[14px] leading-[24px] text-muted-foreground">
                    Execute after:
                  </div>
                  <div className="font-medium text-[16px] leading-[24px]">
                    {new Date(txToSign?.executeAfter * 1000).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="mt-[24px] break-words text-[14px] leading-[24px] text-muted-foreground">
              {txToSign?.data?.toString()}
            </div>
          )}
          {(data?.connectedAccount ?? data?.selectedAccount)
            ?.isSmartContract && (
            <Dialog
              open={autoOpened}
              onOpenChange={(v) => {
                if (!v) {
                  setDate(undefined);
                  setTime(undefined);
                }
                setAutoOpened(v);
              }}
            >
              {!txToSign?.isContractWalletDeployment && (
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    className="w-full mt-[16px] flex justify-center items-center gap-[8px]"
                  >
                    Set Auto Payment <img src={payment} alt="payment" />
                  </Button>
                </DialogTrigger>
              )}
              <DialogContent
                onInteractOutside={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="flex flex-col gap-[24px] font-sans">
                  <div className="text-[20px] leading-[32px] font-bold">
                    Set Auto Payment
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <div className="text-[14px] leading-[24px] text-muted-foreground">
                      Select date
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            'flex items-center justify-between w-full gap-[8px] text-left font-normal',
                            !date && 'text-muted-foreground'
                          )}
                        >
                          {date ? (
                            format(date, 'dd/MM/yyyy')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <img src={calendar} alt="calendar" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-auto border-none">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <div className="text-[14px] leading-[24px] text-muted-foreground">
                      Select time
                    </div>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      lang="en-US"
                      className="w-full bg-background"
                    />
                  </div>
                  <div className="flex w-full items-center gap-[8px]">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setDate(undefined);
                        setTime(undefined);
                        setAutoOpened(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={onSaveAutoPaymentClick}>
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <div className="flex items-center gap-[24px] mt-[32px]">
        <Button variant="outline" className="flex-1" onClick={discardTx}>
          Reject
        </Button>
        <Button className="flex-1" onClick={approveTx}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default SendTransactionPage;
