import React, { useState } from 'react';
import {
  Server,
  Settings,
  Users,
  Shield,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Layers,
  ExternalLink,
  Plus,
  Search,
  Lock,
  Unlock,
  RefreshCw,
  Cpu,
  Database,
  Radio,
  FileCheck,
  Building,
  Key,
  Save,
  Check
} from 'lucide-react';
import {
  SystemId,
  SystemConfigParameters,
  ManageableUser,
  RolePermissionDefinition,
  UserProfile
} from '../../types';
import { SYSTEMS_META, SystemMeta } from '../../data/featuresRegistry';
import {
  INITIAL_SYSTEM_CONFIG,
  INITIAL_MANAGEABLE_USERS,
  INITIAL_ROLE_PERMISSIONS
} from '../../data/mockData';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  currentUser?: UserProfile | null;
  onSelectSystem: (id: SystemId) => void;
  onLaunchStandalone: (id: SystemId) => void;
}

export const ConfigMgmtSystem: React.FC<Props> = ({
  standalone = false,
  currentUser,
  onSelectSystem,
  onLaunchStandalone
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'users' | 'roles' | 'parameters'>('services');

  // Config Parameters State
  const [systemParams, setSystemParams] = useState<SystemConfigParameters>(INITIAL_SYSTEM_CONFIG);
  const [paramSaveNotice, setParamSaveNotice] = useState<string | null>(null);

  // Users State
  const [userList, setUserList] = useState<ManageableUser[]>(INITIAL_MANAGEABLE_USERS);
  const [searchUserKeyword, setSearchUserKeyword] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<ManageableUser['role']>('citizen');
  const [newUserProvince, setNewUserProvince] = useState('巴格达省 (Baghdad)');

  // Role Permissions State
  const [rolesPermissions, setRolesPermissions] = useState<RolePermissionDefinition[]>(INITIAL_ROLE_PERMISSIONS);
  const [selectedRoleId, setSelectedRoleId] = useState<'citizen' | 'agent' | 'admin' | 'auditor'>('citizen');

  // Service health test simulation state
  const [serviceHealthStatus, setServiceHealthStatus] = useState<Record<string, 'healthy' | 'checking'>>({});

  const handleTestService = (code: string) => {
    setServiceHealthStatus(prev => ({ ...prev, [code]: 'checking' }));
    setTimeout(() => {
      setServiceHealthStatus(prev => ({ ...prev, [code]: 'healthy' }));
    }, 600);
  };

  const handleToggleUserStatus = (id: string) => {
    setUserList(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: u.status === '正常' ? '已冻结' : '正常'
        };
      }
      return u;
    }));
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const created: ManageableUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      uid: `usr-gen-${Date.now().toString().slice(-6)}`,
      displayName: newUserName,
      email: newUserEmail,
      role: newUserRole,
      province: newUserProvince,
      department: newUserRole === 'agent' ? '区域特许代销点' : newUserRole === 'admin' ? '配给总局运营科' : '家庭用户',
      status: '正常',
      lastLogin: '刚刚创建',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUserList([created, ...userList]);
    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserModalOpen(false);
  };

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    setParamSaveNotice('✓ 全网配给基准参数已成功更新！规则引擎已毫秒级热加载生效，全量业务子系统已同步校验准则。');
    setTimeout(() => setParamSaveNotice(null), 5000);
  };

  const handleTogglePermission = (
    roleId: 'citizen' | 'agent' | 'admin' | 'auditor',
    sysId: SystemId,
    permKey: 'canRead' | 'canWrite' | 'canApprove' | 'canAudit'
  ) => {
    setRolesPermissions(prev => prev.map(r => {
      if (r.roleId === roleId) {
        return {
          ...r,
          permissions: r.permissions.map(p => {
            if (p.systemId === sysId) {
              return { ...p, [permKey]: !p[permKey] };
            }
            return p;
          })
        };
      }
      return r;
    }));
  };

  const filteredUsers = userList.filter(u => {
    const matchesKeyword =
      u.displayName.toLowerCase().includes(searchUserKeyword.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserKeyword.toLowerCase()) ||
      u.province.toLowerCase().includes(searchUserKeyword.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesKeyword && matchesRole;
  });

  const selectedRoleDef = rolesPermissions.find(r => r.roleId === selectedRoleId) || rolesPermissions[0];

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" /> 微前端服务与网关部署
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> 用户与账号管理
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" /> 角色与 RBAC 权限矩阵
          </button>
          <button
            onClick={() => setActiveTab('parameters')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'parameters'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" /> 全网配给基准参数配置
          </button>
        </div>
      </div>

      {/* Tab 1: Services & Gateway Deployment Management */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Topology Architecture Diagram Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>国家配给微前端服务集群与网关拓扑图 (Envoy / Ingress Topology)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  11 个独立微前端子系统具备自主域名、隔离容器 Pod 与服务端口，通过统一反向代理网关协同交互。
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-800 font-mono">
                  ● 统一网关：gateway.rationcard.gov.iq:443
                </span>
              </div>
            </div>

            {/* Visual Microservice Graph */}
            <div className="bg-slate-950 rounded-xl p-6 text-white border border-slate-800 space-y-6">
              {/* Layer 1: Global Edge Ingress */}
              <div className="flex flex-col items-center">
                <div className="bg-slate-800 border-2 border-blue-500 text-blue-400 px-6 py-2.5 rounded-xl font-mono text-xs font-bold shadow-lg flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>统一协同入口网关 (Reverse Proxy & API Gateway) · 80 / 443</span>
                </div>
                <div className="w-0.5 h-6 bg-slate-700" />
              </div>

              {/* Layer 2: 11 Subsystem Pods */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {SYSTEMS_META.filter(s => s.id !== 'configMgmt').map((sys, idx) => (
                  <div
                    key={sys.id}
                    className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 hover:border-blue-500 transition-colors text-xs space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>{sys.code}</span>
                        <span className="text-emerald-400">● 活跃</span>
                      </div>
                      <div className="font-semibold text-slate-200 mt-1 truncate" title={sys.name}>
                        {sys.name}
                      </div>
                      <div className="font-mono text-[11px] text-blue-400">:{sys.deployPort}</div>
                    </div>
                    <button
                      onClick={() => onLaunchStandalone(sys.id)}
                      className="w-full mt-2 py-1 text-[10px] bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded transition-colors flex items-center justify-center gap-1 font-mono"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>独立沙盒</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Layer 3: Persistence and Intelligence Backends */}
              <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Firestore 核心业务与档案库 (实时持久化)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Gemini 3.5 / 3.1 Pro 智能语义服务</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>内政部 / 司法部 / 粮食储备网跨部门通信总线</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subsystems Detailed Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  独立微前端子系统服务端口治理清单
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  点击「测试健康探针」校验各微服务 HTTP 200 响应，点击「启动独立沙盒」进入单体隔离部署预览。
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">系统代码</th>
                    <th className="py-3 px-4">子系统名称</th>
                    <th className="py-3 px-4">独立服务端口</th>
                    <th className="py-3 px-4">独立生产域名</th>
                    <th className="py-3 px-4">主责角色</th>
                    <th className="py-3 px-4">功能点数</th>
                    <th className="py-3 px-4">健康探针状态</th>
                    <th className="py-3 px-4 text-right">运维操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {SYSTEMS_META.map(sys => {
                    const status = serviceHealthStatus[sys.code] || 'healthy';
                    return (
                      <tr key={sys.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {sys.code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900 dark:text-white">{sys.name}</div>
                          <div className="text-[10px] text-slate-400">{sys.nameEn}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          :{sys.deployPort}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {sys.domain}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {sys.primaryRole}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                            {sys.featureCount} 项
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {status === 'checking' ? (
                            <span className="text-amber-500 font-mono text-[11px] flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> 检测中...
                            </span>
                          ) : (
                            <span className="text-emerald-500 font-mono text-[11px] flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> HTTP 200 (12ms)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleTestService(sys.code)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium transition-colors"
                          >
                            探针自检
                          </button>
                          <button
                            onClick={() => onLaunchStandalone(sys.id)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>独立沙盒</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User & Account Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>平台用户账号与身份治理工作台</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                实时与 Firebase Auth 及 Firestore <code>/users</code> 集合互联，支持新增督察员、代销商账号、冻结异常账号与权限调配。
              </p>
            </div>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>委派/新增系统用户</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜索姓名、邮箱或归属省份..."
                value={searchUserKeyword}
                onChange={e => setSearchUserKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="all">全部角色 (全部)</option>
              <option value="citizen">公民 (Citizen)</option>
              <option value="agent">代销代理商 (Agent)</option>
              <option value="admin">系统管理员 (Admin)</option>
              <option value="auditor">监督审计员 (Auditor)</option>
            </select>
          </div>

          {/* User List Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">用户编号</th>
                  <th className="py-3 px-4">姓名 / 账户</th>
                  <th className="py-3 px-4">系统角色</th>
                  <th className="py-3 px-4">归属省份</th>
                  <th className="py-3 px-4">科室 / 机构单位</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">最后活跃</th>
                  <th className="py-3 px-4 text-right">账户管控</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-500">
                      {user.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{user.displayName}</span>
                        {currentUser?.uid === user.uid && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded">当前登录</span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : user.role === 'agent'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : user.role === 'auditor'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {user.role === 'admin' ? '系统管理员' : user.role === 'agent' ? '配给代销商' : user.role === 'auditor' ? '监督审计员' : '公民个人'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {user.province}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {user.department || '未设定'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        user.status === '正常'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {user.lastLogin}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ml-auto ${
                          user.status === '正常'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {user.status === '正常' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{user.status === '正常' ? '冻结账户' : '解冻恢复'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add User Modal */}
          {isAddUserModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    委派与新增系统用户
                  </h4>
                  <button
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">用户真实姓名：</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      placeholder="例如：阿里·穆罕默德·侯赛因"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">官方电子邮箱 / 登录账号：</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      placeholder="user@ration.gov.iq"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">系统委派角色：</label>
                    <select
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                    >
                      <option value="citizen">公民个人 (Citizen)</option>
                      <option value="agent">配给代销商 (Agent)</option>
                      <option value="admin">系统管理员 (Admin)</option>
                      <option value="auditor">监督审计员 (Auditor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">归属省份：</label>
                    <select
                      value={newUserProvince}
                      onChange={e => setNewUserProvince(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                    >
                      <option value="巴格达省 (Baghdad)">巴格达省 (Baghdad)</option>
                      <option value="巴士拉省 (Basra)">巴士拉省 (Basra)</option>
                      <option value="埃尔比勒省 (Erbil)">埃尔比勒省 (Erbil)</option>
                      <option value="纳杰夫省 (Najaf)">纳杰夫省 (Najaf)</option>
                      <option value="尼尼微省 (Nineveh)">尼尼微省 (Nineveh)</option>
                    </select>
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      立即保存并分配
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Role & RBAC Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>RBAC 角色访问控制与权限矩阵 (Role-Based Access Control)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              定义四大核心系统角色的细粒度数据与业务权限：浏览调阅 (Read)、录入操作 (Write)、审核终审 (Approve) 与质检查账 (Audit)。
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {rolesPermissions.map(r => (
              <button
                key={r.roleId}
                onClick={() => setSelectedRoleId(r.roleId)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  selectedRoleId === r.roleId
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {r.roleName}
              </button>
            ))}
          </div>

          {/* Selected Role Description */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
              当前角色职责说明：
            </span>
            <p className="text-slate-600 dark:text-slate-400">
              {selectedRoleDef.description}
            </p>
          </div>

          {/* Permissions Matrix Grid */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">子系统模块</th>
                  <th className="py-3 px-4 text-center">浏览调阅 (Read)</th>
                  <th className="py-3 px-4 text-center">录入提交 (Write)</th>
                  <th className="py-3 px-4 text-center">业务核准 (Approve)</th>
                  <th className="py-3 px-4 text-center">审计追溯 (Audit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedRoleDef.permissions.map(perm => (
                  <tr key={perm.systemId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {perm.systemName} ({perm.systemId})
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={perm.canRead}
                        onChange={() => handleTogglePermission(selectedRoleId, perm.systemId, 'canRead')}
                        className="rounded text-amber-500 focus:ring-amber-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={perm.canWrite}
                        onChange={() => handleTogglePermission(selectedRoleId, perm.systemId, 'canWrite')}
                        className="rounded text-amber-500 focus:ring-amber-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={perm.canApprove}
                        onChange={() => handleTogglePermission(selectedRoleId, perm.systemId, 'canApprove')}
                        className="rounded text-amber-500 focus:ring-amber-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={perm.canAudit}
                        onChange={() => handleTogglePermission(selectedRoleId, perm.systemId, 'canAudit')}
                        className="rounded text-amber-500 focus:ring-amber-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Global Ration Business Parameters Configuration */}
      {activeTab === 'parameters' && (
        <form onSubmit={handleSaveParameters} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>全网配给业务基准参数与规则引擎阈值配置</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                实时控制系统各处逻辑判定的硬性阈值（包括结婚分户14岁年龄、代理商1500户拆分、250,000 IQD牌照规费及高薪冻结标准）。
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>保存配置并全网热广播</span>
            </button>
          </div>

          {paramSaveNotice && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{paramSaveNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Section 1: Agent & Store Rules */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                <Building className="w-4 h-4 text-blue-500" />
                <span>代销网点设立、拆分与统营管控标准</span>
              </span>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    单网点服务户数上限预警与拆分阈值 (户)：
                  </label>
                  <input
                    type="number"
                    value={systemParams.agentHouseholdMaxCap}
                    onChange={e => setSystemParams({ ...systemParams, agentHouseholdMaxCap: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    法定依据：《全国配给代销网点管理办法》第22条（默认 1500 户，超额触发联合委员会拆分）
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    两网点自愿合并后受服务户数上限 (户)：
                  </label>
                  <input
                    type="number"
                    value={systemParams.agentMergeMaxCap}
                    onChange={e => setSystemParams({ ...systemParams, agentMergeMaxCap: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    法定依据：合并后总户数严禁超过该阈值（默认 750 户，防止局部垄断）
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    食品面粉统营代销经营场所最小使用面积 (㎡)：
                  </label>
                  <input
                    type="number"
                    value={systemParams.agentMinAreaSqM}
                    onChange={e => setSystemParams({ ...systemParams, agentMinAreaSqM: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    法定依据：代销场所营业面积低于此值硬性阻断统营资质审核（默认 20 ㎡）
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Citizen & Family Rules */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>公民分户、冻结与资格准入标准</span>
              </span>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    夫妻申请分户独立领卡最低法定年龄 (周岁)：
                  </label>
                  <input
                    type="number"
                    value={systemParams.marriageMinAgeYears}
                    onChange={e => setSystemParams({ ...systemParams, marriageMinAgeYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    法定依据：《实施细则》第14条（夫妻双方均须年满 14 周岁且具备有效法院结婚证书）
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    公职人员与高收入群体自动冻结月薪线 (IQD 第纳尔)：
                  </label>
                  <input
                    type="number"
                    value={systemParams.salaryFreezeThresholdIqd}
                    onChange={e => setSystemParams({ ...systemParams, salaryFreezeThresholdIqd: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    法定依据：月薪超 150 万第纳尔自动锁定，须由劳动部出具证明并经分部经理复核
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    连续境外旅行出境未归自动冻结时限 (月)：
                  </label>
                  <input
                    type="number"
                    value={systemParams.outOfCountryFreezeMonths}
                    onChange={e => setSystemParams({ ...systemParams, outOfCountryFreezeMonths: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    法定依据：出入境管理局数据对碰，连续离境满 6 个月触发防冒领冻结
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Official Tariffs & Fees */}
            <div className="md:col-span-2 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                <Key className="w-4 h-4 text-amber-500" />
                <span>法定规费资费标准 (贸易部财务与规划司统一核准)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    公民常规业务电子申请规费 (IQD)：
                  </label>
                  <input
                    type="number"
                    value={systemParams.citizenApplicationFeeIqd}
                    onChange={e => setSystemParams({ ...systemParams, citizenApplicationFeeIqd: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono text-purple-600 font-bold"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    默认 2,000 第纳尔 (发卡、信息变更、分户)
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    代理商新设 / 统营 / 拆分核准牌照费 (IQD)：
                  </label>
                  <input
                    type="number"
                    value={systemParams.agentLicenseFeeIqd}
                    onChange={e => setSystemParams({ ...systemParams, agentLicenseFeeIqd: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono text-purple-600 font-bold"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    默认 250,000 第纳尔 (特许资质审验费)
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    代销经营权直系亲属轮替继承规费 (IQD)：
                  </label>
                  <input
                    type="number"
                    value={systemParams.agentInheritanceFeeIqd}
                    onChange={e => setSystemParams({ ...systemParams, agentInheritanceFeeIqd: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg font-mono text-purple-600 font-bold"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    默认 50,000 第纳尔 (亲属继承审验费)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
