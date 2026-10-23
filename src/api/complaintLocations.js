import { getFamilyByCardNo, getTransferOptions } from './citizen.js';
import { getMyAgentCenters } from './agent.js';
import { buildComplaintLocations, complaintAgentId, complaintCardNumber } from '../utils/complaintLocations.js';
import { i18n } from '../locales/index.js';

export async function getComplaintLocations(profile) {
  const cardNo = complaintCardNumber(profile);
  const agentId = complaintAgentId(profile);
  const [catalog, card, outlets] = await Promise.allSettled([
    getTransferOptions(),
    cardNo ? getFamilyByCardNo(encodeURIComponent(cardNo)) : Promise.resolve(null),
    profile.role === 'agent' && agentId ? getMyAgentCenters() : Promise.resolve([])
  ]);
  // The legacy family endpoint can return a demo fallback for an unknown card.
  // Only an exact match is allowed to populate this account's complaint.
  const family = card.status === 'fulfilled' && card.value?.rationCardNo === cardNo ? card.value : null;
  const outlet = outlets.status === 'fulfilled' && Array.isArray(outlets.value) ? outlets.value.find(item => String(item.id) === agentId) : null;
  const result = buildComplaintLocations(catalog.status === 'fulfilled' && Array.isArray(catalog.value) ? catalog.value : [], family, outlet);
  if (result.defaults?.source === 'outlet' && ['ar', 'ckb'].includes(i18n.global.locale.value)) {
    const translatedCenter = result.rows.find(row => row !== result.defaults && row.centerId === result.defaults.centerId && row.provinceId === result.defaults.provinceId);
    if (translatedCenter) result.defaults.center = translatedCenter.center;
    if (outlet.id === 'FA-00128' && ['Karkh 1st Distribution Station', '卡尔赫第一配给中心综合代销站'].includes(outlet.name)) result.defaults.agentName = i18n.global.t('chatOrders.station');
  }
  return result;
}
