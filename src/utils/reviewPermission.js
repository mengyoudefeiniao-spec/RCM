/**
 * 审核流程权限体系统一工具
 *
 * 背景：消息通知新增「待审核消息」审核流程，审核权限在
 * 系统管理-角色-关联功能权限中配置；功能权限目录采用三级结构
 * (模块 → 功能 → 权限项)，审核权限按业务类型划分，并支持
 * 当前角色按审核事项配置可办理区域。
 */

// 三级功能权限目录：模块(一级) → 功能(二级) → 权限项(三级)
// parentCode 指向二级权限码；二级权限若存在子级，界面中作为分组开关
export const PERMISSION_CATALOG = [
  { moduleKey: 'moduleDashboard', code: 'dashboard.view', featureKey: 'dashboardOverview' },
  { moduleKey: 'moduleAgents', code: 'agents.view', featureKey: 'agentsList' },
  { moduleKey: 'moduleAgents', code: 'agents.create', featureKey: 'agentsCreate' },
  { moduleKey: 'moduleAgents', code: 'agents.edit', featureKey: 'agentsEdit' },
  { moduleKey: 'moduleAgents', code: 'agents.delete', featureKey: 'agentsDelete' },
  { moduleKey: 'moduleRation', code: 'ration.view', featureKey: 'rationOverview' },
  { moduleKey: 'moduleRation', code: 'ration.dispatch', featureKey: 'rationDispatch' },
  { moduleKey: 'moduleRation', code: 'warehouse.inboundOutbound', featureKey: 'warehouseInboundOutbound' },
  { moduleKey: 'moduleRation', code: 'warehouse.inventoryLedger', featureKey: 'warehouseInventoryLedger' },
  { moduleKey: 'moduleRation', code: 'warehouse.deliveryVerification', featureKey: 'warehouseDeliveryVerification' },
  { moduleKey: 'moduleRation', code: 'warehouse.citizenClaim', featureKey: 'warehouseCitizenClaim' },
  { moduleKey: 'moduleRation', code: 'warehouse.traceability', featureKey: 'warehouseTraceability' },
  { moduleKey: 'moduleRation', code: 'warehouse.securityAudit', featureKey: 'warehouseSecurityAudit' },
  { moduleKey: 'moduleReview', code: 'review.view', featureKey: 'reviewOverview' },
  { moduleKey: 'moduleReview', code: 'review.process', featureKey: 'process' },
  // 三级权限项：审核处理 → 业务类型
  { moduleKey: 'moduleReview', code: 'review.process.unfreeze', featureKey: 'reviewTypeUnfreeze', parentCode: 'review.process' },
  { moduleKey: 'moduleReview', code: 'review.process.split', featureKey: 'reviewTypeSplit', parentCode: 'review.process' },
  { moduleKey: 'moduleReview', code: 'review.process.changeHead', featureKey: 'reviewTypeChangeHead', parentCode: 'review.process' },
  { moduleKey: 'moduleReview', code: 'review.process.memberEntry', featureKey: 'reviewTypeMemberEntry', parentCode: 'review.process' },
  { moduleKey: 'moduleReview', code: 'review.process.memberTransfer', featureKey: 'reviewTypeMemberTransfer', parentCode: 'review.process' },
  { moduleKey: 'moduleReview', code: 'review.process.agentTransfer', featureKey: 'reviewTypeAgentTransfer', parentCode: 'review.process' },
  { moduleKey: 'moduleComplaints', code: 'complaints.view', featureKey: 'complaintsOverview' },
  { moduleKey: 'moduleComplaints', code: 'complaints.process', featureKey: 'complaintsProcess' },
  { moduleKey: 'moduleSystem', code: 'system.users', featureKey: 'systemManageUsers' },
  { moduleKey: 'moduleSystem', code: 'system.roles', featureKey: 'systemManageRoles' },
  { moduleKey: 'moduleSystem', code: 'system.permissions', featureKey: 'systemManagePermissions' },
  { moduleKey: 'moduleSystem', code: 'system.organizations', featureKey: 'systemManageOrganizations' },
  { moduleKey: 'moduleSystem', code: 'system.audit', featureKey: 'systemViewAudit' },
  { moduleKey: 'moduleMessages', code: 'messages.view', featureKey: 'messagesOverview' },
  { moduleKey: 'moduleMessages', code: 'messages.send', featureKey: 'messagesSend' }
];

export const WAREHOUSE_PERMISSION_CODES = PERMISSION_CATALOG
  .filter((item) => item.code.startsWith('warehouse.'))
  .map((item) => item.code);

// 审核业务类型三级权限码
export const REVIEW_TYPE_CODES = PERMISSION_CATALOG
  .filter((item) => item.parentCode === 'review.process')
  .map((item) => item.code);
export const REGION_SCOPED_PERMISSION_CODES = [...REVIEW_TYPE_CODES, ...WAREHOUSE_PERMISSION_CODES];

// 审核工单来源（中英文）→ 三级审核权限码
const SOURCE_TO_CODE = {
  '申请解冻': 'review.process.unfreeze',
  'Unfreeze Card': 'review.process.unfreeze',
  '申请分户': 'review.process.split',
  'Split Household': 'review.process.split',
  '变更户主': 'review.process.changeHead',
  'Change Head': 'review.process.changeHead',
  '成员录入': 'review.process.memberEntry',
  'Member Entry': 'review.process.memberEntry',
  '成员转移': 'review.process.memberTransfer',
  'Transfer Member': 'review.process.memberTransfer',
  '申请代理转移': 'review.process.agentTransfer',
  'Transfer Agent': 'review.process.agentTransfer'
};

// 审核范围可选区域（伊拉克省级行政区）
export const REVIEW_SCOPE_REGIONS = [
  { value: '巴格达省', labelKey: 'regionBaghdad' },
  { value: '巴士拉省', labelKey: 'regionBasra' },
  { value: '尼尼微省', labelKey: 'regionNineveh' },
  { value: '迪亚拉省', labelKey: 'regionDiyala' },
  { value: '基尔库克省', labelKey: 'regionKirkuk' },
  { value: '安巴尔省', labelKey: 'regionAnbar' },
  { value: '埃尔比勒省', labelKey: 'regionErbil' },
  { value: '苏莱曼尼亚省', labelKey: 'regionSulaymaniyah' }
];

const ADMIN_ROLES = ['admin', 'minister_center', 'deputy_minister', 'director_planning'];

/**
 * 构建三级权限树（模块 → 功能 → 权限项）
 * @param {Array} catalog 权限目录，默认 PERMISSION_CATALOG
 * @returns {Array<{ moduleKey: string, features: Array<{ code, featureKey, children: Array }> }>}
 */
export function buildPermissionTree(catalog = PERMISSION_CATALOG) {
  const modules = [];
  const moduleMap = new Map();
  catalog.forEach((item) => {
    if (!moduleMap.has(item.moduleKey)) {
      const module = { moduleKey: item.moduleKey, features: [] };
      moduleMap.set(item.moduleKey, module);
      modules.push(module);
    }
    moduleMap.get(item.moduleKey).features.push({ ...item, children: [] });
  });
  // 将三级权限项挂到二级功能下
  modules.forEach((module) => {
    module.features.forEach((feature) => {
      catalog
        .filter((item) => item.parentCode === feature.code)
        .forEach((child) => feature.children.push({ ...child, children: [] }));
    });
    // 纯分组节点（存在子级）不参与勾选存储，仅作为分组开关
    module.features = module.features.filter((feature) => feature.children.length === 0 || !feature.parentCode);
  });
  return modules;
}

/**
 * 将角色权限码展开为有效的三级权限码（父码自动展开为全部子级）
 * @param {string[]} codes 角色已授权权限码
 * @returns {string[]} 有效三级权限码
 */
export function resolveEffectiveCodes(codes = []) {
  const set = new Set();
  (Array.isArray(codes) ? codes : []).forEach((code) => {
    const children = PERMISSION_CATALOG.filter((item) => item.parentCode === code);
    if (children.length) children.forEach((child) => set.add(child.code));
    else set.add(code);
  });
  return [...set];
}

/**
 * 解析当前用户的审核权限
 * @param {object} profile 用户画像 (auth store userProfile)
 * @returns {{ isAdmin: boolean, canView: boolean, canProcess: boolean,
 *   types: string[], regionsByType: Record<string, string[]> }}
 */
export function resolveReviewAccess(profile) {
  const isAdmin = ADMIN_ROLES.includes(profile?.role);
  const codes = resolveEffectiveCodes(profile?.permissionCodes);
  const scope = profile?.reviewScope && typeof profile.reviewScope === 'object' ? profile.reviewScope : {};
  const configuredTypes = Array.isArray(scope.types) ? scope.types : null;
  const types = isAdmin && !configuredTypes
    ? [...REVIEW_TYPE_CODES]
    : codes.filter((code) => REVIEW_TYPE_CODES.includes(code) && (!configuredTypes || configuredTypes.includes(code)));
  const legacyRegions = Array.isArray(scope.regions) ? scope.regions : [];
  const regionsByType = scope.regionsByType && typeof scope.regionsByType === 'object'
    ? scope.regionsByType
    : Object.fromEntries(types.map((type) => [type, legacyRegions.length ? legacyRegions : isAdmin ? REVIEW_SCOPE_REGIONS.map((region) => region.value) : []]));
  return {
    isAdmin,
    canView: isAdmin || codes.includes('review.view'),
    canProcess: types.length > 0,
    types,
    regionsByType
  };
}

/**
 * 审核工单来源 → 三级审核权限码
 * @param {string} source 工单来源（兼容中英文）
 * @returns {string} 权限码；无法识别时返回空字符串
 */
export function reviewSourceToCode(source) {
  return SOURCE_TO_CODE[String(source || '').trim()] || '';
}

/**
 * 判断某审核工单是否落在当前用户的审核权限范围内
 * @param {object} ticket 审核工单
 * @param {object} access resolveReviewAccess 的结果
 * @returns {boolean} 是否可审核
 */
export function isTicketInReviewScope(ticket, access) {
  if (!access?.canProcess) return false;
  const typeCode = reviewSourceToCode(ticket?.source);
  if (!typeCode || !access.types.includes(typeCode)) return false;
  const regions = access.regionsByType?.[typeCode] || [];
  return regions.some((region) => String(ticket?.province || '').includes(region));
}

/**
 * 审核权限范围摘要（用于角色列表展示）
 * @param {object} scope 角色 reviewScope
 * @returns {{ typeCount: number, regionCount: number }}
 */
export function summarizeReviewScope(scope) {
  const safe = scope && typeof scope === 'object' ? scope : {};
  const assignments = safe.regionsByType && typeof safe.regionsByType === 'object' ? safe.regionsByType : {};
  const regions = Object.values(assignments).flat().filter(Boolean);
  return { typeCount: Array.isArray(safe.types) ? safe.types.length : 0, regionCount: new Set(regions).size };
}
