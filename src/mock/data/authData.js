export const MOCK_USERS = [
  // 1. 配给中心部长 (Minister of Centers)
  // 职权：授予代理权、统一代理权、设立代理权、拆分大型代理权
  {
    id: 'usr-admin-01',
    username: 'minister_center',
    name: '阿卜杜勒·拉赫曼 (配给中心部长)',
    role: 'minister_center',
    department: '贸易部配给中心部',
    title: '配给中心部长',
    authorities: ['GRANT_AGENT', 'UNIFY_AGENT', 'ESTABLISH_AGENT', 'SPLIT_LARGE_AGENT'],
    avatar: '',
    token: 'jwt-token-minister-center-2026-auth-passed'
  },
  // 2. 行政次长 (Deputy Minister)
  // 职权：已故代理代理权的轮替、已注销代理权的恢复（前提是规划与跟进司确认）
  {
    id: 'usr-admin-02',
    username: 'deputy_minister',
    name: '法鲁克·卡西姆 (行政次长)',
    role: 'deputy_minister',
    department: '贸易部行政次长室',
    title: '行政次长',
    authorities: ['DECEASED_ROTATION', 'RESTORE_AGENT'],
    avatar: '',
    token: 'jwt-token-deputy-minister-2026-auth-passed'
  },
  // 3. 规划与跟进司总干事 (Director of Planning & Follow-up)
  // 职权：代理注销、代理轮替/转移、合并代理权和处罚
  {
    id: 'usr-admin-03',
    username: 'director_planning',
    name: '塔里克·萨利赫 (规划与跟进司总干事)',
    role: 'director_planning',
    department: '规划与跟进司',
    title: '规划与跟进司总干事',
    authorities: ['CANCEL_AGENT', 'ROTATE_TRANSFER_AGENT', 'MERGE_AGENT', 'PENALIZE_AGENT'],
    avatar: '',
    token: 'jwt-token-director-planning-2026-auth-passed'
  },
  // 兼容老账号 admin
  {
    id: 'usr-001',
    username: 'admin',
    name: '阿卜杜勒·拉赫曼 (配给中心部长)',
    role: 'minister_center',
    department: '贸易部配给中心部',
    title: '配给中心部长',
    authorities: ['GRANT_AGENT', 'UNIFY_AGENT', 'ESTABLISH_AGENT', 'SPLIT_LARGE_AGENT'],
    avatar: '',
    token: 'jwt-token-admin-rcm-2026-auth-passed'
  },
  // 公民
  {
    id: 'usr-002',
    username: 'RC-10029381',
    name: '艾哈迈德·哈桑·萨利赫 (户主)',
    role: 'citizen',
    department: '巴格达省卡尔赫区',
    cardNo: 'RC-10029381',
    token: 'jwt-token-citizen-rcm-2026-auth-passed'
  },
  // 代理
  {
    id: 'usr-003',
    username: 'FA-00128',
    name: '穆罕默德·贾巴尔 (第一配给代销店)',
    role: 'agent',
    department: '综合食品面粉代销网点',
    agentCode: 'FA-00128',
    token: 'jwt-token-agent-rcm-2026-auth-passed'
  }
];
