export async function register() {
  // Validate environment variables at startup
  await import('@/lib/env');
}
