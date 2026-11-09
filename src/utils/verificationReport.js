/**
 * Builds the on-site verification deliverable: a bilingual Markdown report,
 * a machine-readable JSON snapshot, and per-case CSV sample sheets.
 */

const VERDICT_LABELS = {
  pass: '可行 / Feasible',
  partial: '有条件可行 / Conditionally feasible',
  fail: '不可行 / Not feasible',
};

const KIND_LABELS = {
  env: '设备与环境 / Device & environment',
  nfc: 'NFC 读卡 / NFC reading',
  capture: '样本采集 / Sample capture',
  qr: '二维码 / Dynamic QR',
  manual: '现场核验 / Manual check',
};

const EXCLUDED_ITEMS = [
  'TV-07 云核验兜底对比（历史试验，待重评）',
  'TV-09 / TV-10 / TV-11 / TV-12 离线花名册、核销队列、回执、库存台账（需后端联调）',
  'TV-13 / TV-14 / TV-15 / TV-16 支付、POS 凭证、短信网关、内政部核验 API（需业主与供应商配合）',
  'TV-17 / TV-18 / TV-19 / TV-20 / TV-24 数据共享、GIS 边界、峰值承载、规则引擎、灾备（需服务端与数据）',
  'TV-23 大模型本地推理、TV-25 视频指南（可分期）',
  'TV-26 生物特征与日志合规（需法务与存储测算）',
  'TV-27 iOS 等价实现（需 iOS 设备与上架流程）',
  'TV-29 CSCA 锚定（需内政部主列表）',
];

function pad(value) {
  return String(value).padStart(2, '0');
}

export function exportFolderName(date = new Date()) {
  return `rcm-verify-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function numeric(values) {
  return values.map(Number).filter(value => Number.isFinite(value));
}

function average(values) {
  const list = numeric(values);
  if (!list.length) return null;
  return list.reduce((total, value) => total + value, 0) / list.length;
}

function histogram(values) {
  const counts = new Map();
  for (const value of values) {
    const key = value === undefined || value === null || value === '' ? '(empty)' : String(value);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function round(value, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '-';
  return Number(value).toFixed(digits);
}

export function summarizeRecords(caseDef, records) {
  const summary = { total: records.length, lines: [], fields: null };
  if (!records.length) return summary;
  const kind = caseDef.kind;
  if (kind === 'nfc') {
    const ok = records.filter(record => record.metrics?.ok).length;
    const latency = average(records.map(record => record.metrics?.isoDepMs));
    const sw = histogram(records.map(record => record.metrics?.aidSw || record.metrics?.error || 'ok'));
    summary.lines = [
      ['读卡成功 / Successful reads', `${ok}/${records.length}`],
      ['成功率 / Success rate', `${round((ok / records.length) * 100, 1)}%`],
      ['ISO-DEP 平均耗时 / Avg ISO-DEP', `${round(latency, 0)} ms`],
      ['状态字分布 / Status words', sw.map(([key, count]) => `${key}×${count}`).join(', ')],
    ];
    summary.fields = ['uid', 'techs', 'atqa', 'sak', 'isoDep', 'aidSw', 'aidMs', 'efComSw', 'isoDepMs', 'error'];
    return summary;
  }
  if (kind === 'capture') {
    const labelKey = caseDef.captureType === 'card' ? 'householdNo'
      : caseDef.captureType === 'face' ? 'subjectId' : 'attackType';
    const unique = new Set(records.map(record => record.input?.[labelKey]).filter(Boolean));
    summary.lines = [
      ['样本数 / Samples', String(records.length)],
      ['去重主体 / Unique subjects', String(unique.size)],
      ['影像数 / Images', String(records.reduce((total, record) => total + (record.imageIds?.length || 0), 0))],
      ['分布 / Distribution', histogram(records.map(record => record.input?.[labelKey])).map(([key, count]) => `${key}×${count}`).join(', ')],
    ];
    summary.fields = ['householdNo', 'subjectId', 'attackType', 'cardYear', 'province', 'pose', 'attributes', 'lighting', 'condition', 'distance', 'scene'];
    return summary;
  }
  if (kind === 'qr') {
    const scan = average(records.map(record => record.metrics?.scanMs));
    const skew = average(records.map(record => record.metrics?.skewMs));
    const blocked = records.filter(record => record.metrics?.replayBlocked).length;
    summary.lines = [
      ['扫码次数 / Scans', String(records.length)],
      ['平均识别耗时 / Avg decode', `${round(scan, 0)} ms`],
      ['平均时钟偏差 / Avg skew', `${round(skew, 0)} ms`],
      ['重放拦截 / Replay blocked', `${blocked}/${records.length}`],
    ];
    summary.fields = ['scanMs', 'skewMs', 'replayBlocked', 'payloadLength', 'ttl'];
    return summary;
  }
  if (kind === 'env') {
    const latest = records[records.length - 1];
    summary.lines = [
      ['探测次数 / Probes', String(records.length)],
      ['机型 / Model', latest.metrics?.model || latest.input?.model || '-'],
      ['Android', latest.metrics?.sdkInt ? `SDK ${latest.metrics.sdkInt}` : '-'],
      ['NFC', latest.metrics?.nfc || '-'],
      ['Play 完整性 / Play integrity', latest.metrics?.playStore ? 'available' : 'unavailable'],
    ];
    return summary;
  }
  const verdicts = histogram(records.map(record => record.verdict || 'unset'));
  summary.lines = [
    ['记录数 / Records', String(records.length)],
    ['结论分布 / Verdicts', verdicts.map(([key, count]) => `${key}×${count}`).join(', ')],
  ];
  return summary;
}

function markdownTable(rows) {
  return rows.map(row => `| ${row.join(' | ')} |`).join('\n');
}

function flattenMetrics(record) {
  const flat = {};
  for (const [key, value] of Object.entries(record.metrics || {})) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'object') flat[key] = JSON.stringify(value);
    else flat[key] = value;
  }
  return flat;
}

function csvEscape(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildCsv(summary, records, caseVerdict = '') {
  const inputKeys = summary.fields ? summary.fields.filter(key => records.some(record => key in (record.input || {}))) : [];
  const metricKeys = ['aidSw', 'aidMs', 'efComSw', 'isoDepMs', 'ok', 'error', 'scanMs', 'skewMs', 'replayBlocked', 'payloadLength', 'ttl'];
  const header = ['recordId', 'createdAt', 'verdict', 'imageFiles', ...inputKeys, ...metricKeys, 'note'];
  const rows = records.map(record => {
    const images = (record.imageFiles || []).join(' ');
    const inputs = inputKeys.map(key => {
      const value = record.input?.[key];
      return Array.isArray(value) ? value.join('|') : value;
    });
    const metrics = metricKeys.map(key => flattenMetrics(record)[key]);
    return [record.id, record.createdAt, record.verdict || caseVerdict, images, ...inputs, ...metrics, record.note || ''].map(csvEscape).join(',');
  });
  return `\uFEFF${[header.map(csvEscape).join(','), ...rows].join('\n')}\n`;
}

/**
 * @param {object} options
 * @param {{tester:string, site:string, notes:string}} options.meta
 * @param {object} options.device flat device snapshot for the report header
 * @param {Array} options.entries [{ caseDef, title, purpose, criteria, records }]
 */
export function buildVerificationReport({ meta, device, entries, generatedAt = new Date() }) {
  const verdictOf = entry => {
    if (entry.verdict) return entry.verdict;
    const verdicts = entry.records.map(record => record.verdict).filter(Boolean);
    if (!verdicts.length) return 'untested';
    if (verdicts.includes('fail')) return 'fail';
    if (verdicts.includes('partial')) return 'partial';
    return 'pass';
  };
  const tested = entries.filter(entry => entry.records.length > 0 || entry.verdict);

  const overviewRows = [['编号 / ID', '验证项 / Item', '优先级 / Priority', '结论 / Verdict', '样本数 / Samples']];
  for (const entry of entries) {
    overviewRows.push([
      entry.caseDef.id,
      entry.title,
      entry.caseDef.priority,
      verdictOf(entry) === 'untested' ? '未测 / Not tested' : VERDICT_LABELS[verdictOf(entry)],
      String(entry.records.length),
    ]);
  }

  const detailBlocks = entries.map(entry => {
    const summary = summarizeRecords(entry.caseDef, entry.records);
    const recordLines = entry.records.slice(-40).map(record => {
      const input = Object.entries(record.input || {})
        .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join('|') : value}`)
        .join('; ');
      const metrics = Object.entries(flattenMetrics(record)).map(([key, value]) => `${key}=${value}`).join('; ');
      const images = (record.imageFiles || []).join(', ');
      const verdict = record.verdict ? `${record.verdict} · ` : '';
      return `- ${record.createdAt} · ${verdict}${input}${metrics ? ` · ${metrics}` : ''}${images ? ` · ${images}` : ''}${record.note ? ` · note: ${record.note}` : ''}`;
    });
    return [
      `### ${entry.caseDef.id} ${entry.title}`,
      '',
      `- 对应清单 / Checklist: ${entry.caseDef.tv}`,
      `- 形式 / Mode: ${KIND_LABELS[entry.caseDef.kind] || entry.caseDef.kind}`,
      `- 结论 / Verdict: ${verdictOf(entry) === 'untested' ? '未测 / Not tested' : VERDICT_LABELS[verdictOf(entry)]}`,
      `- 目的 / Purpose: ${entry.purpose}`,
      `- 判据 / Criteria: ${entry.criteria}`,
      summary.lines.length ? `- 指标 / Metrics: ${summary.lines.map(([label, value]) => `${label}: ${value}`).join(' · ')}` : '- 指标 / Metrics: -',
      `- 记录 / Records: ${entry.records.length}`,
      entry.note ? `- 结论备注 / Notes: ${entry.note}` : null,
      '',
      recordLines.length ? recordLines.join('\n') : '- (无记录 / no records)',
      '',
    ].join('\n');
  });

  const notes = (meta.notes || '').trim();
  const markdown = [
    '# 技术验证报告 / Technical Verification Report',
    '',
    `- 生成时间 / Generated: ${generatedAt.toISOString()}`,
    `- 执行人 / Tester: ${meta.tester || '-'}`,
    `- 现场 / Site: ${meta.site || '-'}`,
    `- 设备 / Device: ${device?.model || '-'} (${device?.manufacturer || '-'}) · Android ${device?.androidRelease || '-'} / API ${device?.sdkInt || '-'}`,
    `- 应用 / App: ${device?.appVersion || '-'} · package ${device?.packageName || '-'} · role ${device?.role || '-'}`,
    `- 完整性 / Integrity: Play ${device?.playStore ? 'available' : 'unavailable'} · root ${device?.root ? 'suspected' : 'no'} · emulator ${device?.emulator ? 'suspected' : 'no'}`,
    `- 应用签名 / Signing SHA-256: ${device?.signature || '-'}`,
    `- 完成进度 / Progress: ${tested.length}/${entries.length}`,
    notes ? `- 现场备注 / Site notes: ${notes}` : null,
    '',
    '## 总览 / Summary',
    '',
    markdownTable(overviewRows),
    '',
    '## 明细 / Details',
    '',
    detailBlocks.join('\n'),
    '## 未纳入本模块的验证项 / Items outside the app module',
    '',
    ...EXCLUDED_ITEMS.map(item => `- ${item}`),
    '',
    '> 本报告仅记录现场采集与自动探测结果，不构成验收结论；阈值与结论须由我方按清单判据离线复核后回写基线。',
    '> This report records on-site observations only. Thresholds and formal conclusions are re-evaluated offline against the checklist criteria.',
    '',
  ].filter(line => line !== null && line !== undefined).join('\n');

  const payload = {
    schema: 'rcm-field-verification@1',
    generatedAt: generatedAt.toISOString(),
    locale: meta.locale || '',
    meta: { tester: meta.tester || '', site: meta.site || '', notes },
    device: device || {},
    entries: entries.map(entry => ({
      caseId: entry.caseDef.id,
      title: entry.title,
      tv: entry.caseDef.tv,
      priority: entry.caseDef.priority,
      kind: entry.caseDef.kind,
      verdict: verdictOf(entry),
      note: entry.note || '',
      summary: summarizeRecords(entry.caseDef, entry.records).lines,
      records: entry.records,
    })),
  };

  const csvFiles = entries
    .filter(entry => entry.records.length > 0 && entry.caseDef.kind !== 'env')
    .map(entry => ({
      path: `csv/${entry.caseDef.id}.csv`,
      text: buildCsv(summarizeRecords(entry.caseDef, entry.records), entry.records, verdictOf(entry)),
    }));

  return { markdown, payload, csvFiles, overviewRows, verdictOf };
}
