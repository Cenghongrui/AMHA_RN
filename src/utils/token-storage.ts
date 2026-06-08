const TOKEN_KEY = 'token';
let memoryToken = process.env.EXPO_PUBLIC_AUTH_TOKEN || '';

function getLocalStorage() {
  if (typeof globalThis.localStorage === 'undefined') {
    return null;
  }

  return globalThis.localStorage;
}

export const tokenStorage = {
  getToken() {
    const storage = getLocalStorage();

    return storage?.getItem(TOKEN_KEY) || memoryToken;
  },
  setToken(token: string) {
    memoryToken = token;

    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    storage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    memoryToken = '';

    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    storage.removeItem(TOKEN_KEY);
  },
};
