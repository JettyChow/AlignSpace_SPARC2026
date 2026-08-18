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

import { BACKEND_BASE_URL, backendRequest, jsonBody } from './backendClient';

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

// Client -> designer handoff: marks the project sent_to_designer so it
// appears on the designer dashboard (see design_service.handoff_to_designer).
export async function handoffProject(projectId, data, getToken) {
  return backendRequest(`/projects/${projectId}/handoff`, {
    method: 'POST',
    body: jsonBody(data),
  }, getToken);
}

// The full packet for one handed-off project — includes ai_deliverable
// (scope, selection sheet, budget, markdown) and materials.
export async function getDesignerProject(projectId, getToken) {
  return backendRequest(`/designer/projects/${projectId}`, {}, getToken);
}

// Direct URL for the generated brief PDF (GET /projects/{id}/brief.pdf).
export function projectBriefPdfUrl(projectId) {
  return `${BACKEND_BASE_URL}/projects/${projectId}/brief.pdf`;
}

// Designer dashboard: projects whose clients completed handoff
// (backend filters on status == "sent_to_designer" — see
// as-ai-server/app/services/designer_service.py).
export async function getDesignerProjects(getToken) {
  return backendRequest('/designer/projects', {}, getToken);
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
