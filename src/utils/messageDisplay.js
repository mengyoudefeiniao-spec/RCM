const SENDER_NAME_KEYS = new Set([
  'mail.senderSystemAdminName',
  'mail.senderMinisterCenterName',
  'mail.senderDeputyMinisterName',
  'mail.senderDirectorPlanningName',
  'mail.senderCitizenName',
  'mail.senderAgentName'
]);

const SENDER_ID_KEYS = Object.freeze({
  'web-001': 'mail.senderSystemAdminName',
  'usr-admin-01': 'mail.senderMinisterCenterName',
  'usr-admin-02': 'mail.senderDeputyMinisterName',
  'usr-admin-03': 'mail.senderDirectorPlanningName',
  'usr-cit-01': 'mail.senderCitizenName',
  'usr-agt-01': 'mail.senderAgentName'
});

const SENDER_ROLE_KEYS = Object.freeze({
  admin: 'mail.senderSystemAdminName',
  minister_center: 'mail.senderMinisterCenterName',
  deputy_minister: 'mail.senderDeputyMinisterName',
  director_planning: 'mail.senderDirectorPlanningName',
  citizen: 'mail.senderCitizenName',
  agent: 'mail.senderAgentName'
});

const LEGACY_SENDER_KEYS = new Map([
  ['system administrator', 'mail.senderSystemAdminName'],
  ['阿卜杜勒·拉赫曼 (配给中心部长)', 'mail.senderMinisterCenterName'],
  ['阿卜杜勒·拉赫曼（配给中心部长）', 'mail.senderMinisterCenterName'],
  ['法鲁克·卡西姆 (行政次长)', 'mail.senderDeputyMinisterName'],
  ['塔里克·萨利赫 (规划与跟进司总干事)', 'mail.senderDirectorPlanningName'],
  ['艾哈迈德·哈桑·萨利赫 (户主)', 'mail.senderCitizenName'],
  ['穆罕默德·贾巴尔 (第一代销网点)', 'mail.senderAgentName']
]);

export function localizedMessageSender(message, t) {
  const storedKey = SENDER_NAME_KEYS.has(message?.senderNameKey) ? message.senderNameKey : '';
  const senderId = String(message?.senderId || '');
  const senderRole = String(message?.senderRole || '').toLowerCase();
  const legacySenderKey = LEGACY_SENDER_KEYS.get(String(message?.sender || '').trim());
  const key = storedKey || SENDER_ID_KEYS[senderId] || SENDER_ROLE_KEYS[senderRole] || legacySenderKey;

  return key ? t(key) : message?.sender || '';
}
