import https from "node:https";
import http from "node:http";
import { URL } from "node:url";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1000;

export interface CpanelApiResponse {
  status: number;
  errors: string[] | null;
  messages: string[] | null;
  data: unknown;
  metadata?: Record<string, unknown>;
}

export interface CpanelApi2Response {
  cpanelresult: {
    apiversion: number;
    func: string;
    module: string;
    data: unknown;
    error?: string;
  };
}

export class CpanelApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly apiErrors?: string[]
  ) {
    super(message);
    this.name = "CpanelApiError";
  }
}

function isLoopbackHostname(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "[::1]") return true;

  const octets = hostname.split(".");
  return (
    octets.length === 4 &&
    octets[0] === "127" &&
    octets.every((octet) => /^\d+$/.test(octet) && Number(octet) <= 255)
  );
}

function parseServerUrl(serverUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(serverUrl);
  } catch {
    throw new CpanelApiError("Invalid CPANEL_SERVER_URL");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new CpanelApiError("CPANEL_SERVER_URL must use HTTP or HTTPS");
  }
  if (parsed.username || parsed.password) {
    throw new CpanelApiError("CPANEL_SERVER_URL must not contain credentials");
  }
  if (parsed.search || parsed.hash) {
    throw new CpanelApiError("CPANEL_SERVER_URL must not contain a query or fragment");
  }

  return parsed;
}

export class CpanelClient {
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly apiToken: string;
  private readonly httpsAgent: https.Agent;
  private readonly httpAgent: http.Agent;
  private readonly timeoutMs: number;

  constructor() {
    const username = process.env.CPANEL_USERNAME;
    const apiToken = process.env.CPANEL_API_TOKEN;
    const serverUrl = process.env.CPANEL_SERVER_URL;

    if (!username || !apiToken || !serverUrl) {
      throw new CpanelApiError(
        "Missing required environment variables: CPANEL_USERNAME, CPANEL_API_TOKEN, CPANEL_SERVER_URL"
      );
    }

    const parsedServerUrl = parseServerUrl(serverUrl);
    if (parsedServerUrl.protocol === "http:") {
      const allowInsecureHttp =
        process.env.CPANEL_ALLOW_INSECURE_HTTP === "true";
      if (!allowInsecureHttp || !isLoopbackHostname(parsedServerUrl.hostname)) {
        throw new CpanelApiError(
          "CPANEL_SERVER_URL must use HTTPS. Plain HTTP is only allowed for loopback hosts when CPANEL_ALLOW_INSECURE_HTTP=true."
        );
      }
      console.warn(
        "[Security Warning] CPANEL_SERVER_URL is using explicitly enabled loopback HTTP. Credentials are not encrypted."
      );
    }

    this.username = username;
    this.apiToken = apiToken;
    this.baseUrl = parsedServerUrl.href.replace(/\/+$/, "");
    this.timeoutMs = Number(process.env.CPANEL_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

    const rejectUnauthorized = process.env.CPANEL_VERIFY_SSL !== "false";

    this.httpsAgent = new https.Agent({
      keepAlive: true,
      maxSockets: 5,
      rejectUnauthorized,
    });

    this.httpAgent = new http.Agent({
      keepAlive: true,
      maxSockets: 5,
    });
  }

  private buildHeaders(): Record<string, string> {
    return {
      Authorization: `cpanel ${this.username}:${this.apiToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };
  }

  private request(method: string, url: string, body?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const isHttps = parsed.protocol === "https:";
      const transport = isHttps ? https : http;

      const options: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method,
        headers: this.buildHeaders(),
        agent: isHttps ? this.httpsAgent : this.httpAgent,
        timeout: this.timeoutMs,
      };

      if (body) {
        options.headers = {
          ...options.headers,
          "Content-Length": Buffer.byteLength(body).toString(),
        };
      }

      const req = transport.request(options, (res) => {
        const chunks: Buffer[] = [];
        let totalBytes = 0;

        res.on("data", (chunk: Buffer) => {
          totalBytes += chunk.length;
          if (totalBytes > MAX_RESPONSE_BYTES) {
            req.destroy();
            reject(
              new CpanelApiError(
                `Response exceeded ${MAX_RESPONSE_BYTES} bytes limit`
              )
            );
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf-8");
          if (res.statusCode && res.statusCode >= 400) {
            reject(
              new CpanelApiError(
                `HTTP ${res.statusCode}: ${responseBody.substring(0, 500)}`,
                res.statusCode
              )
            );
          } else {
            resolve(responseBody);
          }
        });

        res.on("error", (err) =>
          reject(new CpanelApiError(`Response error: ${err.message}`))
        );
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new CpanelApiError(`Request timed out after ${this.timeoutMs}ms`));
      });

      req.on("error", (err) =>
        reject(new CpanelApiError(`Request failed: ${err.message}`))
      );

      if (body) req.write(body);
      req.end();
    });
  }

  private async requestWithRetry(
    method: string,
    url: string,
    body?: string
  ): Promise<string> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.request(method, url, body);
      } catch (err) {
        lastError = err as Error;

        if (err instanceof CpanelApiError && err.statusCode && err.statusCode < 500) {
          throw err;
        }

        if (attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
          console.error(`[API] Retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw lastError;
  }

  async uapi(
    module: string,
    func: string,
    params: Record<string, string> = {}
  ): Promise<CpanelApiResponse> {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/execute/${encodeURIComponent(module)}/${encodeURIComponent(func)}${query ? "?" + query : ""}`;

    console.error(`[API] UAPI ${module}::${func}`);

    const raw = await this.requestWithRetry("GET", url);
    let parsed: { result: CpanelApiResponse };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new CpanelApiError(
        `Invalid JSON response from UAPI ${module}::${func}`
      );
    }

    const result = parsed.result ?? (parsed as unknown as CpanelApiResponse);

    if (result.status === 0 && result.errors?.length) {
      throw new CpanelApiError(
        `UAPI ${module}::${func} failed: ${result.errors.join(", ")}`,
        undefined,
        result.errors
      );
    }

    return result;
  }

  async uapiPost(
    module: string,
    func: string,
    params: Record<string, string> = {}
  ): Promise<CpanelApiResponse> {
    const url = `${this.baseUrl}/execute/${encodeURIComponent(module)}/${encodeURIComponent(func)}`;
    const body = new URLSearchParams(params).toString();

    console.error(`[API] UAPI POST ${module}::${func}`);

    const raw = await this.requestWithRetry("POST", url, body);
    let parsed: { result: CpanelApiResponse };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new CpanelApiError(
        `Invalid JSON response from UAPI ${module}::${func}`
      );
    }

    const result = parsed.result ?? (parsed as unknown as CpanelApiResponse);

    if (result.status === 0 && result.errors?.length) {
      throw new CpanelApiError(
        `UAPI ${module}::${func} failed: ${result.errors.join(", ")}`,
        undefined,
        result.errors
      );
    }

    return result;
  }

  async api2(
    module: string,
    func: string,
    params: Record<string, string> = {}
  ): Promise<unknown> {
    const query = new URLSearchParams({
      cpanel_jsonapi_user: this.username,
      cpanel_jsonapi_apiversion: "2",
      cpanel_jsonapi_module: module,
      cpanel_jsonapi_func: func,
      ...params,
    }).toString();

    const url = `${this.baseUrl}/json-api/cpanel?${query}`;

    console.error(`[API] API2 ${module}::${func}`);

    const raw = await this.requestWithRetry("GET", url);
    let parsed: CpanelApi2Response;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new CpanelApiError(
        `Invalid JSON response from API2 ${module}::${func}`
      );
    }

    if (parsed.cpanelresult?.error) {
      throw new CpanelApiError(
        `API2 ${module}::${func} failed: ${parsed.cpanelresult.error}`
      );
    }

    return parsed.cpanelresult?.data;
  }

  destroy(): void {
    this.httpsAgent.destroy();
    this.httpAgent.destroy();
  }
}
