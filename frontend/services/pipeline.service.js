// Pipeline service — talks to the AI pipeline backend (as-ai-server).
// Routes mirror as-ai-server/src/main.py exactly:
//   GET  /presets/directions
//   POST /intake
//   POST /assemble
//   POST /pipeline/run
//
// Wire shapes match as-ai-server/src/api_schemas.py (BriefRequest,
// AssembleRequest, PipelineRequest) — keep this file in sync if those change.

import { apiRequest, jsonBody } from './apiClient';

export async function getPresetDirections() {
  const data = await apiRequest('/presets/directions');
  return data.directions;
}

// brief: { firm_id, project_id, room_type, room_sqft, budget_band,
//          budget_max, timeline_weeks, priorities, style_chips, chat_text }
export async function runIntake(brief) {
  const data = await apiRequest('/intake', {
    method: 'POST',
    body: jsonBody(brief),
  });
  return { profile: data.profile, directions: data.directions };
}

export async function runAssemble(brief, directionKey) {
  const data = await apiRequest('/assemble', {
    method: 'POST',
    body: jsonBody({ brief, direction_key: directionKey }),
  });
  return data; // RenovationPackage.to_dict()
}

export async function runFullPipeline(brief, directionKey) {
  const data = await apiRequest('/pipeline/run', {
    method: 'POST',
    body: jsonBody({ brief, direction_key: directionKey ?? null }),
  });
  return data; // { profile, directions, deliverable }
}
