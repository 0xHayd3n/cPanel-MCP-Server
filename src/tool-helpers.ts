import { CpanelApiError } from "./cpanel-api.js";

export interface ToolResult {
  [key: string]: unknown;
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

export function formatData(data: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function formatSuccess(message: string, data?: unknown): ToolResult {
  const text = data
    ? `${message}\n\n${JSON.stringify(data, null, 2)}`
    : message;
  return { content: [{ type: "text", text }] };
}

export function formatError(err: unknown): ToolResult {
  let message: string;

  if (err instanceof CpanelApiError) {
    message = err.message;
    if (err.apiErrors?.length) {
      message += "\n\nDetails:\n" + err.apiErrors.map((e) => `  - ${e}`).join("\n");
    }
  } else if (err instanceof Error) {
    message = err.message;
  } else {
    message = String(err);
  }

  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    isError: true,
  };
}

export async function handleToolCall<T>(
  fn: () => Promise<T>
): Promise<ToolResult> {
  try {
    return (await fn()) as ToolResult;
  } catch (err) {
    return formatError(err);
  }
}
