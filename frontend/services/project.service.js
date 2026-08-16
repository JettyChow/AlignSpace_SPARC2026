// Project service — talks to the main backend (NEXT_PUBLIC_BACKEND_URL).
//
//   getProjects()                       -> GET    /projects
//   getProject(projectId)               -> GET    /projects/{project_id}
//   createProject(data)                 -> POST   /projects
//   updateProjectPreferences(id, data)  -> POST   /projects/{project_id}/preferences
//   updateProject(id, data)             -> PUT    /projects/{project_id}
//   deleteProject(projectId)            -> DELETE /projects/{project_id}
//
// No backend instance runs in this repo (only as-ai-server, the AI pipeline,
// does) — until NEXT_PUBLIC_BACKEND_URL points at a running one, every call
// here rejects with an ApiError. Callers must show a real loading/empty/error
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
