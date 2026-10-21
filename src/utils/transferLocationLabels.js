import { TRANSFER_BRANCH_OPTIONS as zhLocations } from '../mock/data/transferData.js';
import { TRANSFER_BRANCH_OPTIONS as enLocations } from '../mock/data/en/transferData.js';

export function buildTransferLabels(tree) {
  const labels = {};
  tree.forEach((province, i) => {
    labels[`province${i}`] = province.province;
    province.branches.forEach((branch, j) => {
      labels[`branch${i}_${j}`] = branch.branchName;
      branch.centers.forEach((center) => {
        labels[`center${center.centerId}`] = center.centerName;
        [...center.flourAgents, ...center.foodAgents].forEach((agent) => {
          const id = agent.id.replaceAll('-', '_');
          labels[`agent${id}`] = agent.name;
          labels[`manager${id}`] = agent.manager;
        });
      });
    });
  });
  return labels;
}

export const baseTransferLabels = { zh: buildTransferLabels(zhLocations), en: buildTransferLabels(enLocations) };
const aliases = new Map(Object.values(baseTransferLabels).flatMap((labels) => Object.entries(labels).map(([key, value]) => [value, key])));

// Display labels are separate from values used for selection, capacity and routing rules.
export function localizeTransferLocation(t, value) {
  const key = aliases.get(value);
  return key ? t(`transferLocations.${key}`) : value;
}

export function transferProvinceKey(value) {
  const text = String(value || '').toLowerCase();
  const provinces = [
    ['province0', ['baghdad', '巴格达', 'بغداد', 'بەغدا']],
    ['province1', ['diyala', '迪亚拉', 'ديالى', 'دیالە']],
    ['province2', ['nineveh', 'ninawa', '尼尼微', 'نينوى', 'نەینەوا']],
    ['province3', ['kirkuk', '基尔库克', 'كركوك', 'کەرکووک']],
    ['province4', ['basra', '巴士拉', 'البصرة', 'بەسرە']]
  ];
  return provinces.find(([, names]) => names.some((name) => text.includes(name.toLowerCase())))?.[0] || text.trim();
}
