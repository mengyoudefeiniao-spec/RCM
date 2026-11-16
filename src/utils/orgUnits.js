/**
 * Organization-unit helpers shared by the system-management screen and tests.
 * Records store language-neutral fields; demo names resolve through nameKey.
 */

export const ORG_UNIT_TYPES = ['ministry', 'directorate', 'branch', 'center'];

const ORG_UNIT_TYPE_KEYS = {
  ministry: 'orgTypeMinistry',
  directorate: 'orgTypeDirectorate',
  branch: 'orgTypeBranch',
  center: 'orgTypeCenter'
};

export function orgUnitTypeKey(type) {
  return ORG_UNIT_TYPE_KEYS[type] || ORG_UNIT_TYPE_KEYS.center;
}

export function normalizeOrgUnitRow(row = {}) {
  const ids = (value) => (Array.isArray(value) ? [...new Set(value.filter(Boolean))] : []);
  return {
    ...row,
    name: String(row.name || '').trim(),
    nameKey: String(row.nameKey || ''),
    code: String(row.code || '').trim().toUpperCase(),
    type: ORG_UNIT_TYPES.includes(row.type) ? row.type : 'center',
    parentId: String(row.parentId || ''),
    province: String(row.province || ''),
    userIds: ids(row.userIds),
    roleIds: ids(row.roleIds)
  };
}

/** Resolves a localized display name; falls back to the stored name for user-created units. */
export function orgUnitDisplayName(row = {}, translate = (key) => key) {
  return row.nameKey ? translate(row.nameKey) : (row.name || '—');
}
