import { COMPLAINT_STATUSES, COMPLAINT_TYPES } from './complaints.js';

const codeFor = (catalog, code, value) => Object.hasOwn(catalog, code || '') ? code
  : Object.keys(catalog).find(key => catalog[key].slice(0, 2).includes(value)) || 'UNKNOWN';

const legacyHandlers = [
  ['director', ['塔里克·萨利赫 (规划与跟进司总干事)', 'Tariq Saleh (Director General)']],
  ['inspector', ['穆斯塔法·纳赛尔 (巴士拉稽查大队)', 'Mustafa Nasser (Basra Inspection Brigade)']],
  ['quality', ['卫生质量检疫处', 'Health Quality & Quarantine Division']],
  ['supervision', ['规划与跟进司服务监督科', 'Service Supervision Division']],
  ['verification', ['信息数据中心核验岗', 'Data Center Verification Officer']]
];

export function complaintDate(value) {
  if (!value || typeof value !== 'string') return null;
  // The original hotline records use local wall time; newer records use ISO timestamps.
  const date = new Date(value.replace(/^(\d{4}-\d{2}-\d{2}) /, '$1T'));
  return Number.isFinite(date.getTime()) ? date : null;
}

export function userScore(ticket) {
  const score = ticket.rating?.score;
  return ticket.statusCode === 'RESOLVED' && typeof score === 'number'
    && Number.isInteger(score) && score >= 1 && score <= 5 ? score : null;
}

export function complaintChannel(ticket) {
  if (ticket.channelCode) return ticket.channelCode;
  if (/AI|智能/.test(ticket.channel || '')) return 'AI';
  if (/1919/.test(ticket.channel || '')) return 'PHONE';
  return 'UNKNOWN';
}

export function analyticsTickets(records = []) {
  const byId = new Map();
  for (const ticket of records) {
    if (!ticket?.id) continue;
    const normalized = { ...ticket,
      statusCode: codeFor(COMPLAINT_STATUSES, ticket.statusCode, ticket.status),
      typeCode: codeFor(COMPLAINT_TYPES, ticket.typeCode, ticket.type),
      channelCode: complaintChannel(ticket),
      handlerNameKey: ticket.handlerNameKey || (() => {
        const legacy = legacyHandlers.find(([, names]) => names.includes(ticket.handlerName));
        return legacy ? `complaintAnalytics.staffNames.${legacy[0]}` : '';
      })()
    };
    const previous = byId.get(ticket.id);
    const revision = item => complaintDate(item.updatedAt || item.rating?.ratedAt || item.handledAt || item.submittedAt)?.getTime() || 0;
    if (!previous || revision(normalized) >= revision(previous)) byId.set(ticket.id, normalized);
  }
  return [...byId.values()];
}

export function filterAnalyticsTickets(records, { dates = [], channel = '', type = '', province = '' } = {}) {
  const start = dates?.[0] ? complaintDate(`${dates[0]}T00:00:00`) : null;
  const end = dates?.[1] ? complaintDate(`${dates[1]}T00:00:00`) : null;
  if (end) end.setDate(end.getDate() + 1);
  return records.filter(ticket => {
    const submitted = complaintDate(ticket.submittedAt);
    return (!start || (submitted && submitted >= start)) && (!end || (submitted && submitted < end))
      && (!channel || ticket.channelCode === channel) && (!type || ticket.typeCode === type)
      && (!province || ticket.province === province);
  });
}

function resolutionHours(ticket) {
  if (ticket.statusCode !== 'RESOLVED') return null;
  const submitted = complaintDate(ticket.submittedAt);
  const handled = complaintDate(ticket.handledAt);
  const hours = submitted && handled ? (handled - submitted) / 3600000 : -1;
  return hours >= 0 ? hours : null;
}

export function summarizeComplaints(tickets) {
  const resolved = tickets.filter(ticket => ticket.statusCode === 'RESOLVED');
  const scores = resolved.map(userScore).filter(score => score !== null);
  const durations = resolved.map(resolutionHours).filter(hours => hours !== null);
  return {
    total: tickets.length, resolved: resolved.length, rated: scores.length,
    unrated: resolved.length - scores.length,
    coverage: resolved.length ? scores.length / resolved.length * 100 : null,
    average: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null,
    satisfaction: scores.length ? scores.filter(score => score >= 4).length / scores.length * 100 : null,
    low: scores.filter(score => score <= 2).length,
    hours: durations.length ? durations.reduce((sum, hours) => sum + hours, 0) / durations.length : null,
    durationSamples: durations.length,
    distribution: [5, 4, 3, 2, 1].map(score => ({ score, count: scores.filter(value => value === score).length }))
  };
}

// Themes are evidence-based keyword rules in all four supported languages, plus the
// recorded complaint category. They do not infer sentiment or invent user feedback.
const themes = [
  ['FEES', /加价|收费|手续费|overcharg|illegal fee|extra fee|رسوم|زيادة السعر|کرێی زیادە|نرخی زیادە/i, 'OVERCHARGE'],
  ['SHORTAGE', /缺斤|短两|克扣|少发|short.?weight|under.?weight|deduction|نقص الوزن|تلاعب بالوزن|کەمێشی|کەمی کێش/i, 'SHORTAGE'],
  ['QUALITY', /品质|质量|变质|异味|发霉|quality|rancid|mould|mold|جودة|تلف|عفن|کوالێتی|بۆگەن|کەموکوڕی کاڵا/i, 'QUALITY'],
  ['WAITING', /排队|等候|queue|waiting|طابور|انتظار|ڕیز|چاوەڕوانی/i],
  ['SERVICE', /态度|辱骂|服务差|rude|attitude|سوء المعاملة|سلوك|هەڵسوکەوت|ڕەفتاری خراپ/i],
  ['QUOTA', /份额|定额|quota|entitlement|حصة|حصص|بەشە|پشک/i, 'QUOTA'],
  ['DELAY', /拖延|处理慢|响应慢|超时|迟迟|delayed|slow response|took too long|تأخر|تأخير|دواکەوتن|وەڵامی هێواش/i],
  ['COMMUNICATION', /没.*通知|无.*回复|没有回复|进度不明|no response|no update|not informed|لا رد|دون رد|عدم الإبلاغ|بێ وەڵام|ئاگادار نەکرا/i],
  ['OUTCOME', /未解决|没.*解决|没有解决|仍然|not resolved|unresolved|still not|لم.*حل|دون حل|چارەسەر نەکرا/i]
];

export function complaintThemes(ticket) {
  const text = [ticket.title, ticket.content, ticket.rating?.comment].filter(Boolean).join('\n');
  const matches = themes.filter(([, pattern, type]) => type === ticket.typeCode || pattern.test(text)).map(([key]) => key);
  if (ticket.typeCode === 'SERVICE' && !matches.includes('WAITING') && !matches.includes('SERVICE')) matches.push('SERVICE');
  return matches;
}

export function problemInsights(tickets) {
  return themes.map(([key]) => {
    const evidence = tickets.filter(ticket => complaintThemes(ticket).includes(key));
    const summary = summarizeComplaints(evidence);
    return { key, ...summary, evidence, priority: summary.low ? 'high' : summary.total >= 3 ? 'recurring' : 'observe' };
  }).filter(theme => theme.total > 0)
    .sort((a, b) => b.low - a.low || b.total - a.total || a.key.localeCompare(b.key));
}

export function complaintCategories(tickets) {
  return [...Object.keys(COMPLAINT_TYPES), 'UNKNOWN'].map(key => ({ key,
    ...summarizeComplaints(tickets.filter(ticket => ticket.typeCode === key))
  })).filter(category => category.total > 0).sort((a, b) => b.total - a.total);
}

export function staffEvaluations(tickets) {
  const staff = new Map();
  const knownIds = new Map();
  for (const ticket of tickets) {
    if (!ticket.handlerId) continue;
    for (const alias of [ticket.handlerNameKey && `label:${ticket.handlerNameKey}`, ticket.handlerName?.trim() && `name:${ticket.handlerName.trim()}`].filter(Boolean)) {
      if (!knownIds.has(alias)) knownIds.set(alias, new Set());
      knownIds.get(alias).add(String(ticket.handlerId));
    }
  }
  for (const ticket of tickets) {
    const alias = ticket.handlerNameKey ? `label:${ticket.handlerNameKey}` : ticket.handlerName?.trim() ? `name:${ticket.handlerName.trim()}` : '';
    const ids = knownIds.get(alias);
    const id = ticket.handlerId || (ids?.size === 1 ? [...ids][0] : '');
    const key = id ? `id:${id}` : alias;
    if (!key) continue;
    if (!staff.has(key)) staff.set(key, { key, name: ticket.handlerName, nameKey: ticket.handlerNameKey, tickets: [] });
    staff.get(key).tickets.push(ticket);
  }
  return [...staff.values()].map(person => ({ ...person, ...summarizeComplaints(person.tickets) }))
    .sort((a, b) => b.rated - a.rated || b.total - a.total || String(a.key).localeCompare(String(b.key)));
}

export function ratingTrend(tickets) {
  const months = new Map();
  for (const ticket of tickets) {
    if (userScore(ticket) === null) continue;
    const date = complaintDate(ticket.rating?.ratedAt);
    if (!date) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months.has(key)) months.set(key, []);
    months.get(key).push(ticket);
  }
  return [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6)
    .map(([month, records]) => ({ month, ...summarizeComplaints(records) }));
}
