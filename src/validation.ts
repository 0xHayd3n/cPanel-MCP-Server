import { CpanelApiError } from "./cpanel-api.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_RE = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
const IPV6_RE = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))(\/\d{1,3})?$/;
const PATH_TRAVERSAL_RE = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
const CRON_FIELD_RE = /^(?:\*(?:\/\d+)?|\d+(?:-\d+)?(?:\/\d+)?(?:,\d+(?:-\d+)?(?:\/\d+)?)*)$/;

export function validateEmail(email: string): { user: string; domain: string } {
  if (!EMAIL_RE.test(email)) {
    throw new CpanelApiError(`Invalid email address format: ${email}`);
  }
  const atIndex = email.lastIndexOf("@");
  return {
    user: email.substring(0, atIndex),
    domain: email.substring(atIndex + 1),
  };
}

export function validateDomain(domain: string): string {
  const cleaned = domain.trim().toLowerCase();
  if (!DOMAIN_RE.test(cleaned)) {
    throw new CpanelApiError(`Invalid domain format: ${domain}`);
  }
  return cleaned;
}

export function validatePath(path: string): string {
  if (PATH_TRAVERSAL_RE.test(path)) {
    throw new CpanelApiError(
      `Path traversal detected — '..' segments are not allowed: ${path}`
    );
  }
  return path;
}

export function splitPath(fullPath: string): { dir: string; file: string } {
  validatePath(fullPath);
  const lastSlash = fullPath.lastIndexOf("/");
  return {
    dir: lastSlash > 0 ? fullPath.substring(0, lastSlash) : "/",
    file: fullPath.substring(lastSlash + 1),
  };
}

export function validateIp(ip: string): string {
  const trimmed = ip.trim();
  if (!IPV4_RE.test(trimmed) && !IPV6_RE.test(trimmed)) {
    throw new CpanelApiError(`Invalid IP address or range: ${ip}`);
  }
  return trimmed;
}

export function validateCronField(
  value: string,
  field: string,
  min: number,
  max: number
): string {
  if (value === "*") return value;
  if (!CRON_FIELD_RE.test(value)) {
    throw new CpanelApiError(`Invalid cron ${field}: ${value}`);
  }
  const numbers = value.replace(/[*\/,-]/g, " ").trim().split(/\s+/).filter(Boolean);
  for (const n of numbers) {
    const num = Number(n);
    if (isNaN(num) || num < min || num > max) {
      throw new CpanelApiError(
        `Cron ${field} value ${n} out of range (${min}-${max})`
      );
    }
  }
  return value;
}
