import Keycloak, { type KeycloakTokenParsed } from "keycloak-js";

import type { GridexRuntimeConfig } from "./gridex-api";
import { forgetSession, rememberSession, requiresFreshLogin, previousRelease } from './session-policy';

export type GridexAuthSession = {
  subject: string;
  email: string;
  name: string;
  preferredUsername: string;
  roles: string[];
};

let keycloak: Keycloak | undefined;
let initialisation: Promise<boolean> | undefined;
let locallyEnded=false;
export const logoutSignalKey='gridex.logout-signal';
const loginIntentKey='gridex.login-intent';
export function pendingGridexLogin(): {realm:string;email:string}|null {
  try {
    const raw=sessionStorage.getItem(loginIntentKey);
    if(!raw)return null;
    const intent=JSON.parse(raw) as {realm?:unknown;email?:unknown;at?:unknown};
    // Do not silently stop enforcing an unfinished account switch after a
    // timeout or a prolonged API outage. A new explicit login replaces it.
    if(typeof intent.realm==='string'&&typeof intent.email==='string'&&typeof intent.at==='number') {
      return {realm:intent.realm,email:intent.email};
    }
  }catch{/* Missing browser storage cannot authorize an identity. */}
  clearGridexLoginIntent();
  return null;
}
export function clearGridexLoginIntent(): void {
  try{sessionStorage.removeItem(loginIntentKey);}catch{/* Optional storage. */}
}
export function clearGridexSession(): void {
  locallyEnded=true;
  keycloak?.clearToken();
  keycloak=undefined;
  initialisation=undefined;
  clearGridexLoginIntent();
}
const returnPathKey='gridex.auth-return-path';
function saveReturnPath() {
  if(hasGridexAuthCallback())return;
  try { sessionStorage.setItem(returnPathKey,window.location.pathname.startsWith('/demo')?'/':window.location.pathname+window.location.search); } catch { /* Optional storage. */ }
}
function restoreReturnPath() {
  try {
    const path=sessionStorage.getItem(returnPathKey);
    sessionStorage.removeItem(returnPathKey);
    if(path?.startsWith('/')&&!path.startsWith('//')&&new URL(path,window.location.origin).origin===window.location.origin) {
      window.history.replaceState({},'',path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  } catch { /* Invalid/unavailable storage never authorizes navigation. */ }
}

export function hasGridexAuthCallback(): boolean {
  if (typeof window === 'undefined') return false;
  return [window.location.search.slice(1), window.location.hash.slice(1)].some(value=>{
    const params=new URLSearchParams(value);
    return params.has('state')&&(params.has('code')||params.has('error'));
  });
}

async function bounded<T>(promise:Promise<T>, ms:number):Promise<T> {
  let timer:ReturnType<typeof setTimeout>|undefined;
  try {
    return await Promise.race([promise,new Promise<never>((_,reject)=>{
      timer=setTimeout(()=>reject(new Error('Identity request timed out')),ms);
    })]);
  } finally { clearTimeout(timer); }
}
export class GridexSessionExpiredError extends Error {
  readonly status = 401;
  constructor() { super('Session expired'); this.name='GridexSessionExpiredError'; }
}

function keycloakServerUrl(issuer: string): string {
  const marker = "/realms/";
  const index = issuer.lastIndexOf(marker);
  if (index < 0) throw new Error("OIDC issuer must end with /realms/{realm}");
  return issuer.slice(0, index);
}

function authRedirect(config: GridexRuntimeConfig): string {
  const url = new URL('/', window.location.origin);
  // Keep the tenant hint in the callback even when browser storage is denied.
  if (config.realm !== 'gridex') url.searchParams.set('realm', config.realm);
  return url.toString();
}

function client(config: GridexRuntimeConfig): Keycloak {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: keycloakServerUrl(config.oidcIssuer),
      realm: config.realm,
      clientId: config.oidcClientId,
    });
  }
  return keycloak;
}

export async function initialiseGridexAuth(config: GridexRuntimeConfig): Promise<GridexAuthSession | null> {
  if (!config.authEnabled || config.mode === "demo") return null;
  const fresh=requiresFreshLogin()&&!hasGridexAuthCallback();
  // A release boundary is a confirmed end of the remembered portal session.
  // Do not even start the identity client's automatic SSO flow in this case.
  if(fresh)return null;
  const instance = client(config);
  // A generic Login page is a new identity choice, and an OIDC callback must
  // consume its own code before any remembered-session SSO check can run.
  const restore=!hasGridexAuthCallback()&&window.location.pathname!=='/login/'&&
    (previousRelease()!==null || (!window.location.pathname.startsWith('/demo')&&!['/','/en/','/about/'].includes(window.location.pathname)));
  if(!initialisation)saveReturnPath();
  initialisation ??= bounded(instance.init({
    flow: "standard",
    pkceMethod: "S256",
    // Top-level SSO restores a server session without relying on third-party cookies.
    ...(!fresh && restore ? { onLoad: 'check-sso' as const } : {}),
    checkLoginIframe: false,
    redirectUri: authRedirect(config),
  }), Math.max(1000,Math.min(config.backendTimeoutMs||5000,15000))).catch(error => {
    if (keycloak === instance) {
      keycloak = undefined;
      initialisation = undefined;
    }
    throw error;
  });
  const authenticated = await initialisation;
  if(locallyEnded||keycloak!==instance)throw new GridexSessionExpiredError();
  restoreReturnPath();
  if (!authenticated || !instance.authenticated) {clearGridexLoginIntent();return null;}
  rememberSession();
  return sessionFrom(instance);
}

export async function gridexLogin(config: GridexRuntimeConfig, fresh = false): Promise<void> {
  locallyEnded=false;
  if (!config.authEnabled || config.mode === "demo") throw new Error("Live sign-in is disabled");
  await initialiseGridexAuth(config);
  const instance = client(config);
  saveReturnPath();
  await instance.login({
    redirectUri: authRedirect(config),
    scope: "openid profile email",
    ...((fresh || requiresFreshLogin()) ? { prompt: 'login' as const, maxAge: 0 } : {}),
  });
}

export async function gridexLoginForEmail(config: GridexRuntimeConfig, realm: string, email: string): Promise<void> {
  if (!/^[a-z][a-z0-9-]{2,30}$/.test(realm) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error('Invalid login route');
  const marker = '/realms/';
  const boundary = config.oidcIssuer.lastIndexOf(marker);
  if (boundary < 0) throw new Error('Invalid identity issuer');
  const routed = { ...config, realm, oidcIssuer: `${config.oidcIssuer.slice(0, boundary + marker.length)}${realm}` };
  clearGridexSession();
  try {
    for(const key of ['gridex.selected-site','gridex.live-return-path',returnPathKey])sessionStorage.removeItem(key);
  }catch{/* Browser storage is optional; private data still requires a verified token. */}
  locallyEnded = false;
  const instance = client(routed);
  await bounded(instance.init({ flow: 'standard', pkceMethod: 'S256', checkLoginIframe: false,
    redirectUri: authRedirect(routed) }), Math.max(1000, Math.min(config.backendTimeoutMs || 5000, 15000)));
  saveReturnPath();
  try {
    sessionStorage.setItem(loginIntentKey,JSON.stringify({realm,email:email.trim().toLowerCase(),at:Date.now()}));
    await instance.login({ redirectUri: authRedirect(routed), scope: 'openid profile email',
      loginHint: email, prompt: 'login', maxAge: 0 });
  }catch(error){clearGridexLoginIntent();throw error;}
}

export async function gridexLogout(config: GridexRuntimeConfig): Promise<void> {
  const instance = client(config);
  if (!initialisation) await initialiseGridexAuth(config);
  const logoutUrl=instance.createLogoutUrl({redirectUri:new URL('/', window.location.origin).toString()});
  forgetSession();
  // Leaving one customer realm must not select it for the next person using
  // this tab. The next generic sign-in starts in the pilot platform realm.
  try { sessionStorage.removeItem('gridex.selected-realm'); } catch { /* Optional storage. */ }
  clearGridexSession();
  try {localStorage.setItem(logoutSignalKey,crypto.randomUUID());}catch{/* Other tabs also verify server identity. */}
  window.dispatchEvent(new Event('gridex:session-ended'));
  window.location.assign(logoutUrl);
}

export async function getGridexAccessToken(config: GridexRuntimeConfig, force = false): Promise<string | undefined> {
  if(locallyEnded)throw new GridexSessionExpiredError();
  const instance = client(config);
  if (!initialisation) await initialiseGridexAuth(config);
  if (!instance.authenticated) return undefined;
  try { await bounded(instance.updateToken(force ? -1 : 30),Math.max(1000,Math.min(config.backendTimeoutMs||5000,15000))); }
  catch(error) {
    // Keycloak clears authentication on a rejected refresh, not on transport/5xx failures.
    if(!instance.authenticated) throw new GridexSessionExpiredError();
    throw error;
  }
  if(locallyEnded||keycloak!==instance)throw new GridexSessionExpiredError();
  return instance.token;
}

function sessionFrom(instance: Keycloak): GridexAuthSession {
  const parsed = instance.tokenParsed as (KeycloakTokenParsed & {
    email?: string;
    name?: string;
    preferred_username?: string;
    realm_access?: { roles?: string[] };
    resource_access?: Record<string, { roles?: string[] }>;
  }) | undefined;
  // Verified token claims are sufficient. An optional account/profile request
  // must never block sign-in or require account-console permissions.
  const clientRoles = instance.clientId ? parsed?.resource_access?.[instance.clientId]?.roles ?? [] : [];
  const realmRoles = parsed?.realm_access?.roles ?? [];
  const name = parsed?.name ?? parsed?.preferred_username ?? "GrideX user";
  return {
    subject: parsed?.sub ?? "",
    email: parsed?.email ?? "",
    name,
    preferredUsername: parsed?.preferred_username ?? "",
    roles: [...new Set([...realmRoles, ...clientRoles])],
  };
}
