export const shortenAddress = (address: string, chars = 4): string => {
  return !!address
    ? `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
    : '';
};
