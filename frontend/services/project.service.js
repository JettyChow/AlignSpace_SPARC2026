// Project service — talks to the main backend (NEXT_PUBLIC_BACKEND_URL).
//
//   getProjects()                       -> GET    /projects
//   getProject(projectId)               -> GET    /projects/{project_id}
//   createProject(data)                 -> POST   /projects
//   updateProjectPreferences(id, data)  -> POST   /projects/{project_id}/preferences
//   updateProject(id, data)             -> PUT    /projects/{project_id}
//   deleteProject(projectId)            -> DELETE /projects/{project_id}
//   generateProject(id)                 -> POST   /projects/{project_id}/generate
//   selectDirection(id, directionId)    -> POST   /projects/{project_id}/directions/select
//
// Until NEXT_PUBLIC_BACKEND_URL points at a running instance, every call here
// rejects with an ApiError. Callers must show a real loading/empty/error
// state, never fall back to invented project data.

import { backendRequest, jsonBody } from './backendClient';

export async function getProjects(getToken) {
  return backendRequest('/projects', {}, getToken);
}

export async function getProject(projectId, getToken) {
  return backendRequest(`/projects/${projectId}`, {}, getToken);
}

export async function createProject(data, getToken) {
  return backendRequest('/projects', {
    method: 'POST',
    body: jsonBody(data),
  }, getToken);
}

// Intake/preference updates (style chips, budget band, room details, ...).
export async function updateProjectPreferences(projectId, preferences, getToken) {
  return backendRequest(`/projects/${projectId}/preferences`, {
    method: 'POST',
    body: jsonBody(preferences),
  }, getToken);
}

// Trigger the main backend to run the AI pipeline for an existing project
// (preferences/chat_messages must already be populated via createProject /
// updateProjectPreferences). Proxies as-ai-server's /intake server-side —
// see as-ai-server/app/routers/pipeline.py.
export async function generateProject(projectId, getToken) {
  return backendRequest(`/projects/${projectId}/generate`, {
    method: 'POST',
  }, getToken);
}

// Persist the chosen direction and have the main backend assemble the
// material package for it (proxies as-ai-server's /assemble server-side —
// see as-ai-server/app/routers/design.py).
export async function selectDirection(projectId, directionId, getToken) {
  return backendRequest(`/projects/${projectId}/directions/select`, {
    method: 'POST',
    body: jsonBody({ direction_id: directionId }),
  }, getToken);
}

// Basic project field updates (title, status, assigned designer, ...).
export async function updateProject(projectId, data, getToken) {
  return backendRequest(`/projects/${projectId}`, {
    method: 'PUT',
    body: jsonBody(data),
  }, getToken);
}

export async function deleteProject(projectId, getToken) {
  return backendRequest(`/projects/${projectId}`, {
    method: 'DELETE',
  }, getToken);
}
