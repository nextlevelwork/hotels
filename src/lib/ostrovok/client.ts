import { getOstrovokCredentials, getOstrovokBaseUrl } from './config';

interface RequestOptions {
  timeout?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT = 30_000;
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 3000];

function getAuthHeader(): string {
  const { keyId, apiKey } = getOstrovokCredentials();
  const encoded = Buffer.from(`${keyId}:${apiKey}`).toString('base64');
  return `Basic ${encoded}`;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function ostrovokFetch<T>(
  path: string,
  body: Record<string, unknown>,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = getOstrovokBaseUrl();
  const url = `${baseUrl}${path}`;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const maxRetries = options.retries ?? MAX_RETRIES;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429 || response.status >= 500) {
        const retryAfter = response.headers.get('Retry-After');
        const delayMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : RETRY_DELAYS[attempt] ?? 3000;

        if (attempt < maxRetries) {
          console.warn(
            `[ostrovok] ${response.status} on ${path}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`
          );
          await sleep(delayMs);
          continue;
        }
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(
          `Ostrovok API error: ${response.status} ${response.statusText} — ${errorBody}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error(`Ostrovok API timeout after ${timeout}ms on ${path}`);
      } else {
        lastError = error as Error;
      }

      if (attempt < maxRetries) {
        await sleep(RETRY_DELAYS[attempt] ?? 1000);
        continue;
      }
    }
  }

  throw lastError ?? new Error(`Ostrovok API request failed: ${path}`);
}
