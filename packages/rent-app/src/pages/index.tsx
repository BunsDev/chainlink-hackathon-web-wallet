import { ClientOnly } from '@/components/common/client-only';
import { Discover } from '@/components/pages/index/discover';
import { MyNfts } from '@/components/pages/index/my-nfts';
import { useRequestUserAccountsProxyWallet } from '@/hooks/use-request-user-accounts-proxy-wallet';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useRequestUserAccountsProxyWallet();

  return (
    <>
      <ClientOnly>{isConnected && <MyNfts />}</ClientOnly>
      <Discover />
    </>
  );
}
