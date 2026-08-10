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

export async function getProjects() {
  return backendRequest('/projects');
}

export async function getProject(projectId) {
  return backendRequest(`/projects/${projectId}`);
}

export async function createProject(data) {
  return backendRequest('/projects', {
    method: 'POST',
    body: jsonBody(data),
  });
}

// Intake/preference updates (style chips, budget band, room details, ...).
export async function updateProjectPreferences(projectId, preferences) {
  return backendRequest(`/projects/${projectId}/preferences`, {
    method: 'POST',
    body: jsonBody(preferences),
  });
}

// Basic project field updates (title, status, assigned designer, ...).
export async function updateProject(projectId, data) {
  return backendRequest(`/projects/${projectId}`, {
    method: 'PUT',
    body: jsonBody(data),
  });
}

export async function deleteProject(projectId) {
  return backendRequest(`/projects/${projectId}`, {
    method: 'DELETE',
  });
}
