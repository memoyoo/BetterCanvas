const fallbackApiUrl = "http://localhost:3000";

function normalizeApiBaseUrl(input: string) {
  return input.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (configuredApiUrl) {
    return normalizeApiBaseUrl(configuredApiUrl);
  }

  if (__DEV__) {
    return fallbackApiUrl;
  }

  throw new Error(
    "EXPO_PUBLIC_API_URL is required for production builds. Set it in your EAS profile or runtime env.",
  );
}

export function getPublicWebUrl(path = "/") {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}
