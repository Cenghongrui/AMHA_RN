import Constants from 'expo-constants';

const DEFAULT_PROXY_PORT = '5174';
const REMOTE_API_ORIGIN = 'http://159.75.169.224:1235';
const API_PREFIX = '/api';

type LegacyManifest = {
  debuggerHost?: string;
  hostUri?: string;
};

type ConstantsWithLegacyManifest = typeof Constants & {
  manifest?: LegacyManifest;
};

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

function withApiPrefix(origin: string) {
  return `${trimTrailingSlash(origin)}${API_PREFIX}`;
}

function getHostFromUri(uri?: string | null) {
  if (!uri) {
    return '';
  }

  return uri.replace(/^https?:\/\//, '').split(':')[0];
}

function getExpoHost() {
  const legacyConstants = Constants as ConstantsWithLegacyManifest;
  const hostUri = Constants.expoConfig?.hostUri || legacyConstants.manifest?.hostUri || legacyConstants.manifest?.debuggerHost;

  return getHostFromUri(hostUri);
}

function getBrowserHost() {
  if (typeof globalThis.location === 'undefined') {
    return '';
  }

  return globalThis.location.hostname;
}

export function resolveApiBaseUrl() {
  const explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (explicitBaseUrl) {
    return trimTrailingSlash(explicitBaseUrl);
  }

  if (process.env.EXPO_OS !== 'web') {
    return withApiPrefix(REMOTE_API_ORIGIN);
  }

  const explicitProxyOrigin = process.env.EXPO_PUBLIC_API_PROXY_ORIGIN;

  if (explicitProxyOrigin) {
    return withApiPrefix(explicitProxyOrigin);
  }

  const proxyPort = process.env.EXPO_PUBLIC_API_PROXY_PORT || DEFAULT_PROXY_PORT;
  const expoHost = getBrowserHost() || getExpoHost();

  if (expoHost) {
    return `http://${expoHost}:${proxyPort}${API_PREFIX}`;
  }

  return `http://localhost:${proxyPort}${API_PREFIX}`;
}
