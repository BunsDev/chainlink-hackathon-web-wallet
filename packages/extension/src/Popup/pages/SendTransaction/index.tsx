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
  const [txToSign, setTxToSign] = useState<SendTransactionRequestDTO>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [autoOpened, setAutoOpened] = useState<boolean>(false);

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

      console.log('Transaction:', tx);
      setTxToSign(tx);
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
      <div className="mt-[24px] bg-white rounded-[16px] py-[8px] px-[17px] flex items-center justify-between">
        <div className="text-[16px] leading-[24px] font-medium">Account 3</div>
        <img src="/assets/icon_arrow_right.svg" alt="icon_arrow_right" />
        <div className="text-[16px] leading-[24px] font-medium">
          {tx?.isContractWalletDeployment
            ? 'Wallet deployment'
            : 'Contract interaction'}
        </div>
      </div>
      <div className="mt-[24px] flex justify-between">
        <div className="flex flex-col gap-[8px]">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Value
          </div>
          <div className="text-[40px] leading-[32px]">
            {formatUnits(tx?.value ?? '0')}
          </div>
        </div>
        <div
          className={cn(
            'flex flex-col gap-[8px]',
            !tx?.isContractWalletDeployment && 'hidden'
          )}
        >
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Contract deployment:
          </div>
          <div className="text-[14px] leading-[24px]">
            https://wlfkjfksjf.com
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
            <img src="/assets/icon_edit.svg" alt="icon_edit" />
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
                {formatUnits(BigNumber.from(txToSign?.gasPrice ?? 0))} ETH
              </div>
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Total Gas:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {formatUnits(
                  BigNumber.from(txToSign?.gasLimit ?? 0).mul(
                    BigNumber.from(txToSign?.gasPrice ?? 0)
                  )
                )}{' '}
                ETH
              </div>
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Total Cost:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {formatUnits(
                  BigNumber.from(txToSign?.gasLimit ?? 0)
                    .mul(BigNumber.from(txToSign?.gasPrice ?? 0))
                    .add(BigNumber.from(txToSign?.value ?? 0))
                )}{' '}
                ETH
              </div>
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Chain:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {txToSign?.chainId}
              </div>
              <div className="text-[14px] leading-[24px] text-muted-foreground">
                Nonce:
              </div>
              <div className="font-medium text-[16px] leading-[24px]">
                {txToSign?.nonce?.toString()}
              </div>
            </div>
          ) : (
            <div className="mt-[24px] break-words text-[14px] leading-[24px] text-muted-foreground">
              {txToSign?.data?.toString()}
            </div>
          )}
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
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="w-full mt-[16px] flex justify-center items-center gap-[8px]"
              >
                Set Auto Payment <img src={payment} alt="payment" />
              </Button>
            </DialogTrigger>
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
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setAutoOpened(false);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
