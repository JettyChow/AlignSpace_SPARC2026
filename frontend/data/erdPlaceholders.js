// Placeholder mock data mirroring ERD tables that have no other representation
// in the codebase yet (see AlignSpaceERD PDF). Field names match the schema's
// <entityPrefix>_<column> convention exactly. Not wired into any screen —
// kept here as a reference shape for future API/mock integration.

export const FIRMS = [
  { firm_id: 1, firm_name: 'Ross Interiors', firm_createdAt: '2025-01-01T00:00:00Z', firm_updatedAt: '2025-01-01T00:00:00Z' },
];

export const USERS = [
  { user_id: 1, user_firstName: 'Elena', user_lastName: 'Ross', user_email: 'elena@rossinteriors.com', user_createdAt: '2025-01-01T00:00:00Z', user_updatedAt: '2025-01-01T00:00:00Z' },
  { user_id: 2, user_firstName: 'Maya', user_lastName: 'Chen', user_email: 'maya.chen@example.com', user_createdAt: '2025-01-01T00:00:00Z', user_updatedAt: '2025-01-01T00:00:00Z' },
];

export const FIRM_USERS = [
  { firmUser_id: 1, firm_id: 1, user_id: 1, firmUser_role: 'designer', firmUser_joinedAt: '2025-01-01T00:00:00Z' },
  { firmUser_id: 2, firm_id: 1, user_id: 2, firmUser_role: 'client', firmUser_joinedAt: '2025-01-01T00:00:00Z' },
];

export const ROOM_TYPES = [
  { roomType_id: 1, roomType_name: 'Living Room', roomType_description: '' },
  { roomType_id: 2, roomType_name: 'Kitchen', roomType_description: '' },
];

export const BUDGETS = [
  { bud_id: 1, roomType_id: 1, bud_label: 'Standard', bud_minAmount: 10000, bud_maxAmount: 30000, bud_description: '' },
  { bud_id: 2, roomType_id: 2, bud_label: 'Premium', bud_minAmount: 30000, bud_maxAmount: 60000, bud_description: '' },
];

export const PRESETS = [
  { preset_id: 1, firm_id: 1, roomType_id: 1, bud_id: 1, preset_name: 'Warm Minimal Living Room', preset_description: '', preset_estimatedTotal: 24000, preset_status: 'active', preset_createdAt: '2025-01-01T00:00:00Z', preset_updatedAt: '2025-01-01T00:00:00Z' },
];

export const PRESET_STYLES = [
  { presetSty_id: 1, preset_id: 1, sty_id: 'warm-minimal' },
];

export const PROJECT_STYLES = [
  { projSty_id: 1, proj_id: 1, sty_id: 'warm-minimal' },
];

export const ROOMS = [
  { room_id: 1, proj_id: 1, roomType_id: 1, preset_id: 1, room_name: 'Living Room', room_notes: '', room_budgetMinOverride: null, room_budgetMaxOverride: null },
];

export const MESSAGES = [
  { mess_id: 1, proj_id: 1, user_id_sender: 1, mess_senderType: 'designer', mess_messageType: 'text', mess_body: 'Welcome to your project!', mess_metadata: {}, mess_createdAt: '2025-01-01T00:00:00Z' },
];

export const MATERIALS = [
  { mat_id: 1, mat_name: 'White Oak', mat_category: 'Wood', mat_type: 'Cabinetry', mat_color: 'Natural', mat_finish: 'Matte' },
];

export const ITEMS_MATERIALS = [
  { itemMat_id: 1, item_id: 1, mat_id: 1, itemMat_isPrimary: true },
];

export const PRESET_ITEMS = [
  { presetItem_id: 1, preset_id: 1, item_id: 1, presetItem_quantity: 1, presetItem_unitCost: 4200, presetItem_notes: '', presetItem_isRequired: true, presetItem_rank: 1 },
];

export const ITEM_ALTERNATIVES = [
  { alt_id: 1, projItem_id: 1, alternative_item_id: 2, alt_reason: '', alt_rank: 1 },
];

export const IMAGES_STYLES = [
  { imgSty_id: 1, img_id: 1, sty_id: 'warm-minimal' },
];

export const ROOMS_IMAGES = [
  { roomImg_id: 1, room_id: 1, img_id: 1, roomImg_rank: 1, roomImg_selected: true, roomImg_reason: '', roomImg_createdAt: '2025-01-01T00:00:00Z' },
];
