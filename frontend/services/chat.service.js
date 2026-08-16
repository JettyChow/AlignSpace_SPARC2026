// Chat service — talks to the main backend and sends Clerk token when provided.

import { backendRequest, jsonBody } from './backendClient';

export async function getMessages(projectId, getToken) {
  return backendRequest(`/projects/${projectId}/messages`, {}, getToken);
}

export async function sendMessage(projectId, message, getToken) {
  const payload =
    typeof message === 'string'
      ? { sender: 'user', message }
      : {
          sender: message.sender || 'user',
          message: message.message || message.text,
          timestamp: message.timestamp,
        };

  return backendRequest(`/projects/${projectId}/messages`, {
    method: 'POST',
    body: jsonBody(payload),
  }, getToken);
}

export async function deleteMessage(messageId) {
  throw new Error(`Deleting messages is not supported by the backend yet: ${messageId}`);
}
