export const getSessionPassword = async () => {
  const password = (await chrome.storage.local.get(['password']))['password'];
  return password as string | undefined | null;
};

export const setSessionPassword = async (password: string) => {
  await chrome.storage.local.set({ password });
};
