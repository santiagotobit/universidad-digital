// Token management is handled by cookies only
// No need to store tokens in localStorage since backend uses httpOnly cookies

export function setAuthToken(_token: string | null) {
  // No-op: cookies are handled automatically by axios withCredentials
}

export function getAuthToken() {
  // No-op: cookies are handled automatically
  return null;
}
