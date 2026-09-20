// Non-secret hints only. Credentials/tokens remain in Keycloak's in-memory client.
const key = 'gridex.session-release';
export function releaseId(): string {
  return typeof document === 'undefined' ? 'development' : document.querySelector('meta[name="gridex-release"]')?.getAttribute('content') || 'development';
}
export function previousRelease(): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function rememberSession(): void {
  try { localStorage.setItem(key, releaseId()); } catch { /* SSO still works without storage. */ }
}
export function forgetSession(): void {
  try { localStorage.removeItem(key); } catch { /* Storage can be disabled. */ }
}
export function requiresFreshLogin(): boolean {
  const previous = previousRelease();
  return previous !== null && previous !== releaseId();
}
