import { REVIEW_SCOPE_REGIONS } from './reviewPermission.js';

const ADMIN_ROLES = ['admin', 'minister_center', 'deputy_minister', 'director_planning'];
const RECIPIENT_TYPES = ['citizens', 'agents', 'web'];

function groupCode(action, group) {
  return `messages.${action}.${group}`;
}

function granted(rawCodes, code, isAdmin) {
  return isAdmin || rawCodes.some((grant) => code === grant || code.startsWith(`${grant}.`));
}

function groupGranted(rawCodes, group, isAdmin) {
  return isAdmin || rawCodes.includes(group);
}

function groupValues(rawCodes, group, isAdmin) {
  if (groupGranted(rawCodes, group, isAdmin)) return ['*'];
  const prefix = `${group}.`;
  return [...new Set(rawCodes.filter((code) => code.startsWith(prefix)).map((code) => code.slice(prefix.length)))];
}

/** Add entity-specific message permissions from the same hierarchy used by the composer. */
export function buildMessagePermissionEntries(recipientTree = [], regions = REVIEW_SCOPE_REGIONS, adminUsers = []) {
  const entries = [];
  const addRegions = (action, group) => regions.forEach((region) => entries.push({
    moduleKey: 'moduleMessages',
    code: `${groupCode(action, group)}.${region.code}`,
    featureKey: region.labelKey || 'messageProvinceEntry',
    parentCode: groupCode(action, group),
    entityKind: 'region',
    entityId: region.code,
    displayName: region.label || region.value || region.name || region.code
  }));
  const addTreeEntities = (action, group, featureKey, kind, nodes, regionCode, counter) => nodes.forEach((node) => {
    if (!node?.id) return;
    const index = counter.value++;
    entries.push({
      moduleKey: 'moduleMessages',
      code: `${groupCode(action, group)}.${node.id}`,
      featureKey,
      parentCode: groupCode(action, group),
      entityKind: kind,
      entityId: String(node.id),
      regionCode: regionCode || node.regionCode,
      displayIndex: index
    });
  });

  for (const action of ['send', 'review']) {
    addRegions(action, 'region');
    const agents = [];
    const sites = [];
    for (const root of recipientTree) {
      const region = regions.find((item) => root.regionCode === item.code
        || String(root.province || root.name || '').includes(item.value)
        || String(item.value || '').includes(String(root.province || root.name || '').split(/[（(]/)[0].trim()));
      if (!region) continue;
      const collect = (nodes, regionCode) => (nodes || []).forEach((node) => {
        const children = Array.isArray(node.children) ? node.children : [];
        if (String(node.level || '').toUpperCase() === 'STREET' || (!children.length && node.storeName)) {
          sites.push({ ...node, regionCode });
          return;
        }
        agents.push({ ...node, regionCode });
        collect(children, regionCode);
      });
      collect(root.children, region.code);
    }
    const agentCounter = { value: 0 };
    const siteCounter = { value: 0 };
    addTreeEntities(action, 'agent', 'messageAgentEntry', 'agent', agents, undefined, agentCounter);
    addTreeEntities(action, 'site', 'messageSiteEntry', 'site', sites, undefined, siteCounter);
    adminUsers.forEach((user, index) => {
      if (!user?.id || user.status === 'disabled' || user.enabled === false) return;
      const username = String(user.username || user.email || user.id);
      const name = String(user.name || username);
      entries.push({
        moduleKey: 'moduleMessages',
        code: `${groupCode(action, 'web')}.${user.id}`,
        featureKey: 'messageAdminUserEntry',
        parentCode: groupCode(action, 'web'),
        entityKind: 'adminUser',
        entityId: String(user.id),
        displayIndex: index,
        displayName: `${name} · ${username}`
      });
    });
  }
  return entries;
}

function actionAccess(rawCodes, action, isAdmin) {
  const code = (group) => groupCode(action, group);
  const regionAll = groupGranted(rawCodes, code('region'), isAdmin);
  const agentAll = groupGranted(rawCodes, code('agent'), isAdmin);
  const siteAll = groupGranted(rawCodes, code('site'), isAdmin);
  const cardAppUserAll = groupGranted(rawCodes, code('cardAppUser'), isAdmin);
  const direct = isAdmin || rawCodes.includes(`messages.${action}`);
  const webAll = groupGranted(rawCodes, code('web'), isAdmin) || direct;
  const webUsers = webAll ? ['*'] : groupValues(rawCodes, code('web'), isAdmin);
  const web = webAll || webUsers.length > 0;
  const regionValues = groupValues(rawCodes, code('region'), isAdmin);
  const agentValues = groupValues(rawCodes, code('agent'), isAdmin);
  const siteValues = groupValues(rawCodes, code('site'), isAdmin);
  const cardAppUserValues = groupValues(rawCodes, code('cardAppUser'), isAdmin);
  const activeRegions = REVIEW_SCOPE_REGIONS.map((region) => region.code);
  const sendRegions = regionAll ? activeRegions : regionValues;
  const cardAppUserRegions = cardAppUserAll ? activeRegions : cardAppUserValues;
  const hasAnyScope = direct || regionAll || agentAll || siteAll || cardAppUserAll || web
    || regionValues.length > 0 || agentValues.length > 0 || siteValues.length > 0 || cardAppUserValues.length > 0;
  return {
    direct,
    can: hasAnyScope,
    regions: sendRegions,
    agents: agentAll ? ['*'] : agentValues,
    sites: siteAll ? ['*'] : siteValues,
    cardAppUserRegions,
    regionAll,
    agentAll,
    siteAll,
    cardAppUserAll,
    webAll,
    webUsers,
    web
  };
}

export function resolveMessageAccess(profile) {
  const isAdmin = ADMIN_ROLES.includes(profile?.role);
  const rawCodes = Array.isArray(profile?.permissionCodes) ? profile.permissionCodes : [];
  const send = actionAccess(rawCodes, 'send', isAdmin);
  const review = actionAccess(rawCodes, 'review', isAdmin);
  const canView = isAdmin || granted(rawCodes, 'messages.view', false);
  const canSend = send.can;
  const canReview = review.can;
  const recipientTypes = (access) => RECIPIENT_TYPES.filter((type) => {
    if (access.direct) return true;
    if (type === 'citizens') return access.cardAppUserAll || access.cardAppUserRegions.length > 0;
    if (type === 'agents') return access.regionAll || access.agentAll || access.siteAll
      || access.regions.length > 0 || access.agents.length > 0 || access.sites.length > 0;
    return access.web;
  });
  return {
    canView,
    canSend,
    canReview,
    directSend: send.direct,
    directReview: review.direct,
    sendTypes: recipientTypes(send),
    reviewTypes: recipientTypes(review),
    sendRegions: send.regions,
    sendAgents: send.agents,
    sendSites: send.sites,
    sendCardAppUserRegions: send.cardAppUserRegions,
    sendAllRegions: send.regionAll,
    sendAllAgents: send.agentAll,
    sendAllSites: send.siteAll,
    sendAllCardAppUsers: send.cardAppUserAll,
    sendWebUsers: send.webUsers,
    sendAllWebUsers: send.webAll,
    reviewRegions: review.regions,
    reviewAgents: review.agents,
    reviewSites: review.sites,
    reviewCardAppUserRegions: review.cardAppUserRegions,
    reviewAllRegions: review.regionAll,
    reviewAllAgents: review.agentAll,
    reviewAllSites: review.siteAll,
    reviewAllCardAppUsers: review.cardAppUserAll,
    reviewWebUsers: review.webUsers,
    reviewAllWebUsers: review.webAll
  };
}

export function isMessageRecipientTypeAllowed(recipientType, access) {
  return RECIPIENT_TYPES.includes(recipientType) && access?.sendTypes?.includes(recipientType);
}

function messageRegionCode(message) {
  if (message?.regionCode) return String(message.regionCode);
  const regionId = String(message?.regionId || message?.province || message?.regionName || '');
  const legacyProvinceCode = regionId.match(/^PROV-AGT-([A-Z]{3})/i)?.[1]?.toUpperCase();
  return (regionId ? REVIEW_SCOPE_REGIONS.find((region) => region.value === regionId || region.value.startsWith(regionId))?.code : '')
    || (REVIEW_SCOPE_REGIONS.some((region) => region.code === regionId) ? regionId : '')
    || (REVIEW_SCOPE_REGIONS.some((region) => region.code === legacyProvinceCode) ? legacyProvinceCode : '');
}

function scopeAllows(message, access, action, recipientType) {
  const canPerformAction = action === 'send' ? access?.canSend : access?.canReview;
  if (!canPerformAction) return false;
  if (access.direct) return true;
  if (!RECIPIENT_TYPES.includes(recipientType)) return false;
  if (recipientType === 'web') {
    if (access[`${action}AllWebUsers`]) return true;
    const allowedUsers = (access[`${action}WebUsers`] || []).map(String);
    const recipientIds = Array.isArray(message?.recipientIds) ? message.recipientIds.map(String) : [];
    return recipientIds.length > 0 && recipientIds.every((id) => allowedUsers.includes(id));
  }
  const regionCode = messageRegionCode(message);
  if (recipientType === 'citizens') {
    return access[`${action}AllCardAppUsers`]
      || access[`${action}CardAppUserRegions`]?.includes(regionCode);
  }
  if (access[`${action}AllRegions`] || access[`${action}Regions`]?.includes(regionCode)) return true;
  if (message?.siteId) return access[`${action}AllSites`] || access[`${action}Sites`]?.includes(String(message.siteId));
  if (message?.agentId) return access[`${action}AllAgents`] || access[`${action}Agents`]?.includes(String(message.agentId));
  return false;
}

export function isMessageInReviewScope(message, access) {
  return scopeAllows(message, access, 'review', message?.recipientType);
}

export function isMessageInSendScope(message, access) {
  return scopeAllows(message, access, 'send', message?.recipientType);
}
