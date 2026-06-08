import Constants from 'expo-constants';

const DEFAULT_PROXY_PORT = '5174';

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

export function resolveApiBaseUrl() {
  const explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (explicitBaseUrl) {
    return trimTrailingSlash(explicitBaseUrl);
  }

  const proxyPort = process.env.EXPO_PUBLIC_API_PROXY_PORT || DEFAULT_PROXY_PORT;
  const expoHost = getExpoHost();

  if (expoHost) {
    return `http://${expoHost}:${proxyPort}/api`;
  }

  return `http://localhost:${proxyPort}/api`;
}
