export const getSessionPassword = async () => {
  const password = (await chrome.storage.local.get(['password']))['password'];
  console.log('password', password);
  return password;
};

export const setSessionPassword = async (password: string) => {
  await chrome.storage.local.set({ password });
};
