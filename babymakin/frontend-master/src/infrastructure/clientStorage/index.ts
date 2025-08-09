const get = (key: ClientStorageKeys) => {
  const data = localStorage.getItem(key as any as string);
  if (data) return JSON.parse(data);
  return null;
};

const set = (key: ClientStorageKeys, data: any) => {
  if (data) {
    const parsed = JSON.stringify(data);
    localStorage.setItem(key as any as string, parsed);
  }
};

const clear = (key: ClientStorageKeys) => {
  localStorage.removeItem(key as any as string);
};

const resetAll = () => {
  localStorage.clear();
};

export const clientStorage = Object.freeze({
  get,
  set,
  resetAll,
  clear,
});

export enum ClientStorageKeys {
  user_token = "userToken",
  get_started_config = "getStartedConfig",
}
