import https from "node:https";
import http from "node:http";
import { URL } from "node:url";

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

export class CpanelClient {
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly apiToken: string;

  constructor() {
    const username = process.env.CPANEL_USERNAME;
    const apiToken = process.env.CPANEL_API_TOKEN;
    const serverUrl = process.env.CPANEL_SERVER_URL;

    if (!username || !apiToken || !serverUrl) {
      throw new CpanelApiError(
        "Missing required environment variables: CPANEL_USERNAME, CPANEL_API_TOKEN, CPANEL_SERVER_URL"
      );
    }

    this.username = username;
    this.apiToken = apiToken;
    this.baseUrl = serverUrl.replace(/\/+$/, "");
  }

  private buildHeaders(): Record<string, string> {
    return {
      Authorization: `cpanel ${this.username}:${this.apiToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };
  }

  private request(
    method: string,
    url: string,
    body?: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const transport = parsed.protocol === "https:" ? https : http;

      const options: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method,
        headers: this.buildHeaders(),
        rejectUnauthorized: false,
      };

      if (body) {
        options.headers = {
          ...options.headers,
          "Content-Length": Buffer.byteLength(body).toString(),
        };
      }

      const req = transport.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf-8");
          if (res.statusCode && res.statusCode >= 400) {
            reject(
              new CpanelApiError(
                `HTTP ${res.statusCode}: ${responseBody}`,
                res.statusCode
              )
            );
          } else {
            resolve(responseBody);
          }
        });
      });

      req.on("error", (err) =>
        reject(new CpanelApiError(`Request failed: ${err.message}`))
      );

      if (body) req.write(body);
      req.end();
    });
  }

  async uapi(
    module: string,
    func: string,
    params: Record<string, string> = {}
  ): Promise<CpanelApiResponse> {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/execute/${module}/${func}${query ? "?" + query : ""}`;

    console.error(`[API] UAPI ${module}::${func}`);

    const raw = await this.request("GET", url);
    let parsed: { result: CpanelApiResponse };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new CpanelApiError(`Invalid JSON response from cPanel: ${raw.substring(0, 200)}`);
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
    const url = `${this.baseUrl}/execute/${module}/${func}`;
    const body = new URLSearchParams(params).toString();

    console.error(`[API] UAPI POST ${module}::${func}`);

    const raw = await this.request("POST", url, body);
    let parsed: { result: CpanelApiResponse };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new CpanelApiError(`Invalid JSON response from cPanel: ${raw.substring(0, 200)}`);
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

    const raw = await this.request("GET", url);
    let parsed: CpanelApi2Response;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new CpanelApiError(`Invalid JSON response from cPanel: ${raw.substring(0, 200)}`);
    }

    if (parsed.cpanelresult?.error) {
      throw new CpanelApiError(
        `API2 ${module}::${func} failed: ${parsed.cpanelresult.error}`
      );
    }

    return parsed.cpanelresult?.data;
  }

  getUsername(): string {
    return this.username;
  }
}
