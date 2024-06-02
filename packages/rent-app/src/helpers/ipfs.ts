export const ipfsToHttp = (ipfsUrl: string | undefined) => {
  return ipfsUrl
    ? ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
    : undefined;
};
