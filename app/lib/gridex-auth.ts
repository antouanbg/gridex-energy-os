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
export function clearGridexSession(): void {
  locallyEnded=true;
  keycloak?.clearToken();
  keycloak=undefined;
  initialisation=undefined;
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
  const instance = client(config);
  const fresh=requiresFreshLogin()&&!hasGridexAuthCallback();
  const restore=previousRelease()!==null || (!window.location.pathname.startsWith('/demo')&&!['/','/en/','/login/','/about/'].includes(window.location.pathname));
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
  if(fresh) {
    await instance.login({redirectUri:authRedirect(config),prompt:'login',maxAge:0,scope:'openid profile email'});
    return null;
  }
  restoreReturnPath();
  if (!authenticated || !instance.authenticated) return null;
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

export async function gridexLogout(config: GridexRuntimeConfig): Promise<void> {
  const instance = client(config);
  if (!initialisation) await initialiseGridexAuth(config);
  const logoutUrl=instance.createLogoutUrl({redirectUri:authRedirect(config)});
  forgetSession();
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
