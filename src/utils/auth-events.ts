type AuthEvent = {
  type: 'expired';
  message: string;
};

type AuthEventListener = (event: AuthEvent) => void;

const listeners = new Set<AuthEventListener>();

export function subscribeAuthEvent(listener: AuthEventListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyAuthExpired(message = '登录状态已过期，请重新登录') {
  listeners.forEach((listener) => listener({ type: 'expired', message }));
}
