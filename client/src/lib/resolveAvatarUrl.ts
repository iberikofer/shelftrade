const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:5000';

/**
 * Resolves a user avatar URL to an absolute URL.
 * Relative `/uploads/...` paths are prefixed with the server base URL.
 */
export function resolveAvatarUrl(avatarUrl?: string | null): string | null {
  if (!avatarUrl) return null;
  return avatarUrl.startsWith('http') ? avatarUrl : `${SERVER_URL}${avatarUrl}`;
}
