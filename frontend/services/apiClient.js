// Shared fetch wrapper for the AI pipeline backend (as-ai-server).
// Default port matches as-ai-server's actual listener (see app.yaml /
// as-ai-server/Dockerfile: http_port 8000). Override with NEXT_PUBLIC_API_URL
// when pointing at a deployed instance.
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status, detail } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export async function parseResponse(response) {
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    if (response.ok) throw error;
  }

  if (!response.ok) {
    // Only a parsed JSON `detail`/`message` is trusted as user-facing text.
    // An upstream failure (e.g. nginx returning 502 while a backend service
    // is down/restarting) returns an HTML error page as `text` — that must
    // never be rendered verbatim in the UI. The raw body is still kept on
    // `.detail` for debugging/logging.
    const parsedDetail = typeof data?.detail === 'string' ? data.detail : null;
    const parsedMessage = typeof data?.message === 'string' ? data.message : null;
    const message = parsedDetail || parsedMessage || `Request failed with status ${response.status}`;

    throw new ApiError(message, {
      status: response.status,
      detail: data ?? text,
    });
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

export function jsonBody(data) {
  return JSON.stringify(data ?? {});
}
