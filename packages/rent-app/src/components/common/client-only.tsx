import { useIsClient } from '@/hooks/use-is-client';
import { PropsWithChildren } from 'react';

export const ClientOnly = ({ children }: PropsWithChildren) => {
  const isClient = useIsClient();

  return isClient ? children : null;
};
