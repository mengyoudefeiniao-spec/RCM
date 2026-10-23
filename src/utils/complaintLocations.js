import { transferProvinceKey } from './transferLocationLabels.js';

export function complaintCardNumber(profile) {
  return String(profile?.cardNo || profile?.rationCardNo || (profile?.id === 'usr-cit-01' && profile?.role === 'citizen' ? 'RC-10029381' : ''));
}

export function complaintAgentId(profile) {
  return String(profile?.agentId || profile?.agentCode || (profile?.id === 'usr-agt-01' && profile?.role === 'agent' ? 'FA-00128' : ''));
}

export function buildComplaintLocations(tree = [], family = null, outlet = null) {
  const rows = [];
  for (const province of tree) {
    const provinceId = transferProvinceKey(province.province);
    for (const branch of province.branches || []) {
      for (const center of branch.centers || []) {
        const base = { provinceId, province: province.province, centerId: String(center.centerId), center: center.centerName };
        rows.push({ ...base, agentId: '', agentName: '' });
        for (const agent of [...(center.flourAgents || []), ...(center.foodAgents || [])]) rows.push({ ...base, agentId: String(agent.id), agentName: agent.name });
      }
    }
  }
  let defaults = null;
  if (family) {
    const agentIds = String(family.agentId || '').split(/\s*(?:\/|＆|&|,)\s*/).filter(Boolean);
    const matches = rows.filter(row => agentIds.includes(row.agentId));
    const matched = rows.find(row => family.centerId && row.centerId === String(family.centerId)) || matches[0];
    const province = family.province || matched?.province || '';
    const center = family.centerName || family.center || matched?.center || family.district || '';
    defaults = {
      province, provinceId: transferProvinceKey(province),
      center, centerId: String(family.centerId || matched?.centerId || (center ? `card:${family.rationCardNo}` : '')),
      agentName: family.agentName || [...new Set(matches.map(row => row.agentName))].join(' ＆ '),
      agentId: String(family.agentId || ''), cardNo: family.rationCardNo, source: 'card'
    };
  } else if (outlet) {
    defaults = { provinceId: transferProvinceKey(outlet.province), province: outlet.province || '', centerId: String(outlet.centerId || ''), center: outlet.centerName || '', agentId: String(outlet.id), agentName: outlet.name || '', source: 'outlet' };
  }
  // Keep the actual card's names selectable even if its outlet is outside the transfer catalog.
  if (defaults) {
    const related = rows.filter(row => row.provinceId === defaults.provinceId);
    if (related.length) defaults.province = related[0].province;
    rows.unshift(defaults);
  }
  return { rows, defaults };
}

export function complaintLocationOptions(rows, field, provinceId = '', centerId = '') {
  const idField = { province: 'provinceId', center: 'centerId', agentName: 'agentId' }[field];
  const seen = new Set();
  return rows.filter(row => field === 'province' || (!provinceId || row.provinceId === provinceId) && (field !== 'agentName' || !centerId || row.centerId === centerId))
    .filter(row => row[field] && row[idField] && !seen.has(row[idField]) && seen.add(row[idField]))
    .map(row => ({ id: row[idField], value: row[field] }));
}
