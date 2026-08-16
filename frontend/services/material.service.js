// Material/image service — talks to the main backend and sends Clerk token when provided.

import { backendRequest, jsonBody } from './backendClient';

export async function getMaterials(projectId, getToken) {
  return backendRequest(`/projects/${projectId}/materials`, {}, getToken);
}

export async function uploadMaterial(projectId, file, getToken) {
  return backendRequest(`/projects/${projectId}/images`, {
    method: 'POST',
    body: jsonBody({
      filename: file.name,
      image_url: file.image_url || file.url || '',
    }),
  }, getToken);
}

export async function deleteMaterial(materialId) {
  throw new Error(`Deleting materials is not supported by the backend yet: ${materialId}`);
}
