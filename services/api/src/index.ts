import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import postgres from "postgres";

const port = Number(process.env.PORT ?? 8080);
const databaseUrl = required("DATABASE_URL");
const oidcIssuer = trimSlash(required("OIDC_ISSUER"));
const oidcAudience = process.env.OIDC_AUDIENCE?.trim();
const openRemoteBaseUrl = trimSlash(required("OPENREMOTE_BASE_URL"));
const allowedOrigins = new Set(
  (process.env.CORS_ALLOWED_ORIGINS ?? "https://gridex.tech")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

const sql = postgres(databaseUrl, {
  max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: true,
});
const jwks = createRemoteJWKSet(new URL(`${oidcIssuer}/protocol/openid-connect/certs`));

type AuthenticatedRequest = IncomingMessage & { identity?: JWTPayload };

const server = createServer(async (request: AuthenticatedRequest, response) => {
  try {
    applyCors(request, response);
    if (request.method === "OPTIONS") return end(response, 204);

    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/health") {
      return json(response, 200, { status: "ok", service: "gridex-api" });
    }
    if (request.method === "GET" && url.pathname === "/ready") {
      const [database, openremote] = await Promise.all([databaseHealth(), openRemoteHealth()]);
      const ready = database === "up" && openremote === "up";
      return json(response, ready ? 200 : 503, { status: ready ? "ready" : "degraded", database, openremote });
    }

    request.identity = await authenticate(request);
    if (request.method === "GET" && url.pathname === "/api/v1/me") {
      return json(response, 200, {
        subject: request.identity.sub,
        email: request.identity.email,
        name: request.identity.name ?? request.identity.preferred_username,
      });
    }
    if (request.method === "GET" && url.pathname === "/api/v1/sites") {
      const sites = await sql`
        select s.id, s.name, s.status, s.country_code, s.timezone, s.market_code,
               s.openremote_asset_id
          from organisation_users ou
          join sites s on s.organisation_id = ou.organisation_id
         where ou.identity_subject = ${request.identity.sub ?? ""}
           and ou.status = 'active'
         order by s.name
      `;
      return json(response, 200, { items: sites });
    }

    return json(response, 404, { error: "not_found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const unauthorised = message === "missing_bearer_token" || message === "invalid_access_token";
    return json(response, unauthorised ? 401 : 500, {
      error: unauthorised ? "unauthorised" : "internal_error",
    });
  }
});

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`GrideX API listening on ${port}\n`);
});

async function authenticate(request: IncomingMessage): Promise<JWTPayload> {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) throw new Error("missing_bearer_token");
  try {
    const result = await jwtVerify(authorization.slice(7), jwks, {
      issuer: oidcIssuer,
      ...(oidcAudience ? { audience: oidcAudience } : {}),
    });
    return result.payload;
  } catch {
    throw new Error("invalid_access_token");
  }
}

async function databaseHealth(): Promise<"up" | "down"> {
  try {
    await sql`select 1`;
    return "up";
  } catch {
    return "down";
  }
}

async function openRemoteHealth(): Promise<"up" | "down"> {
  try {
    const response = await fetch(openRemoteBaseUrl, { signal: AbortSignal.timeout(3000) });
    return response.status < 500 ? "up" : "down";
  } catch {
    return "down";
  }
}

function applyCors(request: IncomingMessage, response: ServerResponse): void {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,X-Request-Id");
  }
}

function json(response: ServerResponse, status: number, payload: unknown): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function end(response: ServerResponse, status: number): void {
  response.statusCode = status;
  response.end();
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

async function shutdown(): Promise<void> {
  server.close();
  await sql.end({ timeout: 5 });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
