import { ClientOnly } from '@/components/common/client-only';
import { Discover } from '@/components/pages/index/discover';
import { MyNfts } from '@/components/pages/index/my-nfts';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <>
      <ClientOnly>{isConnected && <MyNfts />}</ClientOnly>
      <Discover />
    </>
  );
}
