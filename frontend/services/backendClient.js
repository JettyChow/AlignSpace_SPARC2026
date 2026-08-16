// Shared fetch wrapper for the main backend (projects/chat/materials — the
// "Eng 2" service). Distinct from apiClient.js, which talks to as-ai-server
// (the AI pipeline) on NEXT_PUBLIC_API_URL. No default here: until
// NEXT_PUBLIC_BACKEND_URL points at a running instance, requests fail and
// callers are expected to show an honest empty/error state rather than fall
// back to mock data.
import { ApiError, parseResponse } from './apiClient';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');

async function getAuthHeaders(getToken) {
  if (!getToken) return {};

  const token = await getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function backendRequest(path, options = {}, getToken) {
  if (!BACKEND_URL) {
    throw new ApiError('NEXT_PUBLIC_BACKEND_URL is not configured.', { status: 0 });
  }

  const authHeaders = await getAuthHeaders(getToken);

  const headers = {
    Accept: 'application/json',
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...authHeaders,
    ...options.headers,
  };

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

export function jsonBody(data) {
  return JSON.stringify(data ?? {});
}
