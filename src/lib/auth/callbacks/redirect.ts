export async function redirectCallback({ url, baseUrl }: { url: string; baseUrl: string }) {
  // Check if user needs password setup
  if (url.includes('needsPasswordSetup=true')) {
    return `${baseUrl}/auth/setup-password`;
  }
  
  // Allows relative callback URLs
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  // Allows callback URLs on the same origin
  else if (new URL(url).origin === baseUrl) return url;
  return baseUrl;
}
