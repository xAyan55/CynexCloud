// Helper to get a stable, clean avatar image for a user
// Tries Gravatar via SHA-256 hash first, falls back to a deterministic aesthetic local avatar

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export const getFallbackAvatar = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Pick from OSLO collection (1 to 14) which is clean and aesthetic
  const num = (Math.abs(hash) % 14) + 1;
  return `/images/pfp/Circle/OSLO-${num}.png`;
};

export const getAvatarUrl = async (email: string, userId: string): Promise<string> => {
  if (!email) return getFallbackAvatar(userId);
  
  try {
    const hash = await sha256(email);
    // Gravatar SHA-256 endpoint with 404 fallback parameter
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=128`;
    
    // Check if Gravatar exists
    const res = await fetch(gravatarUrl, { method: "HEAD" });
    if (res.ok) {
      return gravatarUrl;
    }
  } catch {
    // Fall through to local fallback on network error/404
  }
  
  return getFallbackAvatar(userId);
};
