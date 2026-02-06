export type ApiMode = 'mock' | 'ostrovok';

export function getApiMode(): ApiMode {
  const mode = process.env.NEXT_PUBLIC_API_MODE;
  if (mode === 'ostrovok') return 'ostrovok';
  return 'mock';
}

export function isOstrovokMode(): boolean {
  return getApiMode() === 'ostrovok';
}

// Server-only config — never import on client
export function getOstrovokCredentials() {
  const keyId = process.env.OSTROVOK_KEY_ID;
  const apiKey = process.env.OSTROVOK_API_KEY;
  if (!keyId || !apiKey) {
    throw new Error('OSTROVOK_KEY_ID and OSTROVOK_API_KEY must be set');
  }
  return { keyId, apiKey };
}

export function getOstrovokBaseUrl(): string {
  return (
    process.env.OSTROVOK_BASE_URL ||
    'https://api-sandbox.worldota.net/api/b2b/v3'
  );
}
