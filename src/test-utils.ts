/**
 * Create a Request object for testing Next.js route handlers.
 */
export function createRequest(
  url: string,
  options?: RequestInit,
): Request {
  return new Request(new URL(url, 'http://localhost:3000'), options);
}

/**
 * Parse JSON body from a NextResponse.
 */
export async function parseResponse<T = unknown>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

/**
 * Extract redirect URL from a redirect Response.
 */
export function getRedirectUrl(response: Response): string {
  return response.headers.get('location') || '';
}
