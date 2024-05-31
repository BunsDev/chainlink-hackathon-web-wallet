import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/button';
import { useNavigate } from 'react-router-dom';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import QRCode from 'react-qr-code';
import { useDeployContract } from '../../hooks/mutations/use-deploy-contract';
import { Loader2 } from 'lucide-react';
import { useGetDeployContract } from '../../hooks/read/use-get-deploy-contract-tx';
import { GetDeploySmartWalletContractTxDto } from '../../../lib/providers/background/methods/internal/getDeploySmartWalletContractTx';
import { useUserAccounts } from '../../hooks/read/use-user-accounts';
import { useCurrentNetwork } from '../../hooks/read/use-current-network';
import { getNextAccountId } from '../../../lib/providers/background/methods/internal/initializeWallet';

enum Step {
  Review = 'Review',
  Activate = 'Activate',
}

const Review = () => {
  const { data } = useUserAccounts();
  const { data: currentNetwork } = useCurrentNetwork();
  return (
    <>
      <div className="self-center flex gap-[10px] mt-[24px] items-center">
        <div className="w-[24px] h-[24px] flex items-center justify-center bg-primary border border-primary text-primary-foreground rounded-full">
          1
        </div>
        <div className="bg-primary h-[1px] w-[42px]" />
        <div className="w-[24px] h-[24px] flex items-center justify-center bg-transparent border border-primary text-primary rounded-full">
          2
        </div>
      </div>
      <div className="mt-[32px] text-[18px] font-medium leading-[24px]">
        Review
      </div>
      <div className="flex flex-col gap-[16px] flex-1">
        <div className="flex flex-col gap-[4px]">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Name of new Smart Contract
          </div>
          <div className="text-[16px] leading-[24px] font-medium">
            {data?.accounts && getNextAccountId(data?.accounts!, true).name}
          </div>
        </div>
        <div className="border border-[#D0CFFD] w-full border-dashed" />
        <div className="flex flex-col gap-[8px]">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Smart Contract owner
          </div>
          <div className="flex items-center gap-[12px]">
            <img src="/assets/sc_owner.svg" alt="sc_owner" />
            <div className="text-[16px] leading-[24px] font-medium">
              {data?.selectedAccount?.name}
            </div>
          </div>
        </div>
        <div className="border border-[#D0CFFD] w-full border-dashed" />
        <div className="flex flex-col gap-[4px]">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Address
          </div>
          <div className="text-[16px] leading-[24px] font-medium">
            {data?.selectedAccount?.address}
          </div>
        </div>
        <div className="border border-[#D0CFFD] w-full border-dashed" />
        <div className="flex items-center justify-between">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Network
          </div>
          <div className="text-[14px] leading-[24px] font-medium">
            {currentNetwork?.name}
          </div>
        </div>
      </div>
    </>
  );
};

const Activate = ({
  setTx,
}: {
  setTx: (tx: GetDeploySmartWalletContractTxDto) => void;
}) => {
  const { data } = useGetDeployContract();
  const { data: userAccounts } = useUserAccounts();
  const { data: currentNetwork } = useCurrentNetwork();

  useEffect(() => {
    if (data?.deployTx) setTx(data?.deployTx);
  }, [data]);

  return (
    <>
      <div className="self-center flex gap-[10px] mt-[24px] items-center">
        <div className="w-[24px] h-[24px] flex items-center justify-center bg-success border border-success text-primary-foreground rounded-full">
          <img src="/assets/icon_check.svg" alt="icon_check" />
        </div>
        <div className="bg-primary h-[1px] w-[42px]" />
        <div className="w-[24px] h-[24px] flex items-center justify-center bg-primary border border-primary text-primary-foreground rounded-full">
          2
        </div>
      </div>
      <div className="mt-[32px] text-[18px] font-medium leading-[24px]">
        Activate your Smart Contract
      </div>
      <div className="mt-[8px] text-[16px] leading-[24px] text-muted-foreground">
        Please deposit funds to the master account, to cover fees for deployment
        of the smart-contract account.
      </div>
      <div className="grid grid-cols-2 mt-[24px]">
        <div className="flex flex-col gap-[4px]">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Amount
          </div>
          <div className="text-[16px] leading-[24px] font-medium">
            {data?.deployTx?.totalCost} {currentNetwork?.nativeSymbol}
          </div>
        </div>
        <div className="flex flex-col gap-[4px]">
          <div className="text-[14px] leading-[24px] text-muted-foreground">
            Network
          </div>
          <div className="text-[16px] leading-[24px] font-medium">
            {currentNetwork?.name}
          </div>
        </div>
      </div>
      <div className="mt-[16px] flex flex-col gap-[4px]">
        <div className="text-[14px] leading-[24px] text-muted-foreground">
          Address
        </div>
        <div className="text-[16px] leading-[24px] font-medium">
          {userAccounts?.selectedAccount?.address}
        </div>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <div>
          {userAccounts?.selectedAccount?.address && (
            <QRCode
              value={userAccounts?.selectedAccount?.address}
              style={{ width: '98px', height: '98px' }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export const GenerateContractPage = () => {
  const [step, setStep] = useState(Step.Review);
  const navigate = useNavigate();
  const { mutateAsync: deployContract, isPending } = useDeployContract();
  const [tx, setTx] = useState<GetDeploySmartWalletContractTxDto | null>(null);

  const map = useMemo(
    () => ({
      [Step.Review]: <Review />,
      [Step.Activate]: <Activate setTx={setTx} />,
    }),
    []
  );

  const onBack = () => {
    if (step === Step.Review) {
      return navigate('/');
    }

    if (step === Step.Activate) {
      setStep(Step.Review);
    }
  };

  const onNext = async () => {
    if (step === Step.Review) {
      return setStep(Step.Activate);
    }

    if (step === Step.Activate) {
      if (tx) {
        await deployContract(tx);
        navigate('/');
      }
    }
  };

  return (
    <div className="px-[24px] pt-[24px] pb-[36px] flex flex-col h-full">
      <div className="text-[24px] leading-[32px] font-bold">
        Generate Smart Contract
      </div>
      {map[step]}
      <div className="flex gap-[24px] items-center">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button className="flex-1" onClick={onNext} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 animate-spin" />} Next
        </Button>
      </div>
    </div>
  );
};
