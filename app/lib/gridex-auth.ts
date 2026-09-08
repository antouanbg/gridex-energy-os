import Keycloak, { type KeycloakProfile, type KeycloakTokenParsed } from "keycloak-js";

import type { GridexRuntimeConfig } from "./gridex-api";

export type GridexAuthSession = {
  subject: string;
  email: string;
  name: string;
  preferredUsername: string;
  roles: string[];
};

let keycloak: Keycloak | undefined;
let initialisation: Promise<boolean> | undefined;

function keycloakServerUrl(issuer: string): string {
  const marker = "/realms/";
  const index = issuer.lastIndexOf(marker);
  if (index < 0) throw new Error("OIDC issuer must end with /realms/{realm}");
  return issuer.slice(0, index);
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
  initialisation ??= instance.init({
    onLoad: "check-sso",
    flow: "standard",
    pkceMethod: "S256",
    checkLoginIframe: true,
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    silentCheckSsoFallback: false,
  });
  const authenticated = await initialisation;
  if (!authenticated) return null;
  return sessionFrom(instance);
}

export async function gridexLogin(config: GridexRuntimeConfig): Promise<void> {
  const instance = client(config);
  if (!initialisation) await initialiseGridexAuth(config);
  await instance.login({
    redirectUri: `${window.location.origin}${window.location.pathname}`,
    scope: "openid profile email",
  });
}

export async function gridexLogout(config: GridexRuntimeConfig): Promise<void> {
  const instance = client(config);
  if (!initialisation) await initialiseGridexAuth(config);
  await instance.logout({ redirectUri: `${window.location.origin}${window.location.pathname}` });
}

export async function getGridexAccessToken(config: GridexRuntimeConfig): Promise<string | undefined> {
  const instance = client(config);
  if (!initialisation) await initialiseGridexAuth(config);
  if (!instance.authenticated) return undefined;
  await instance.updateToken(30);
  return instance.token;
}

async function sessionFrom(instance: Keycloak): Promise<GridexAuthSession> {
  const parsed = instance.tokenParsed as (KeycloakTokenParsed & {
    email?: string;
    name?: string;
    preferred_username?: string;
    realm_access?: { roles?: string[] };
    resource_access?: Record<string, { roles?: string[] }>;
  }) | undefined;
  let profile: KeycloakProfile | undefined;
  try {
    profile = await instance.loadUserProfile();
  } catch {
    // Profile is optional; verified ID/access-token claims remain the fallback.
  }
  const clientRoles = parsed?.resource_access?.[instance.clientId]?.roles ?? [];
  const realmRoles = parsed?.realm_access?.roles ?? [];
  const name = profile?.firstName || profile?.lastName
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
    : parsed?.name ?? parsed?.preferred_username ?? profile?.username ?? "GrideX user";
  return {
    subject: parsed?.sub ?? "",
    email: profile?.email ?? parsed?.email ?? "",
    name,
    preferredUsername: profile?.username ?? parsed?.preferred_username ?? "",
    roles: [...new Set([...realmRoles, ...clientRoles])],
  };
}
