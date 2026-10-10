import React, { useState } from 'react';
import { ALL_125_FEATURES, SYSTEMS_META } from '../data/featuresRegistry';
import { FeaturePoint, SystemId } from '../types';
import { Search, X, CheckCircle, ExternalLink, Filter, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature: (feature: FeaturePoint) => void;
}

export const FeaturesMatrixModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectFeature
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredFeatures = ALL_125_FEATURES.filter(item => {
    const matchSearch =
      item.id.toString().includes(searchTerm) ||
      item.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSystem = selectedSystemFilter === 'all' || item.systemId === selectedSystemFilter;
    const matchRole = selectedRoleFilter === 'all' || item.role.includes(selectedRoleFilter);

    return matchSearch && matchSystem && matchRole;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                125
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                全平台 125 项功能点架构矩阵与一键测试直通车
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              对应上传需求规格全量功能清单 · 11个独立子系统 · 点击任意功能点可秒级直达对应业务界面进行实测
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜索序号 (1-125)、功能点、规则关键词 (如 14周岁, 1500户, OCR, 冻结)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* System Filter */}
            <select
              value={selectedSystemFilter}
              onChange={e => setSelectedSystemFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">全部 11 个独立系统 ({ALL_125_FEATURES.length})</option>
              {SYSTEMS_META.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.featureCount})</option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRoleFilter}
              onChange={e => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <option value="all">全部使用角色</option>
              <option value="公民">公民</option>
              <option value="配给代理">配给代理</option>
              <option value="配给分部员工">配给分部员工</option>
              <option value="分部经理">分部经理</option>
              <option value="规划与跟进司">规划与跟进司</option>
              <option value="商业监督司">商业监督司</option>
              <option value="仓库管理">仓库管理人员</option>
              <option value="贸易部">贸易部管理决策</option>
              <option value="系统 (自动)">系统 (自动运行)</option>
            </select>
          </div>
        </div>

        {/* Feature List Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-slate-500 mb-2">
            检索匹配到 <strong className="text-slate-900 dark:text-white">{filteredFeatures.length}</strong> 项功能点：
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-3 py-2.5 font-medium w-12 text-center">序号</th>
                  <th className="px-3 py-2.5 font-medium w-36">所属系统</th>
                  <th className="px-3 py-2.5 font-medium w-28">功能模块</th>
                  <th className="px-3 py-2.5 font-medium w-40">功能点</th>
                  <th className="px-3 py-2.5 font-medium">功能描述与业务规则</th>
                  <th className="px-3 py-2.5 font-medium w-32">使用角色</th>
                  <th className="px-3 py-2.5 font-medium w-24 text-center">快捷实测</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredFeatures.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-400">
                      {item.id}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white">
                      {item.system}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                      {item.module}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-blue-600 dark:text-blue-400">
                      {item.featureName}
                    </td>
                    <td className="px-3 py-2.5 leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.description}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 text-[11px]">
                      {item.role}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => {
                          onSelectFeature(item);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1 mx-auto"
                      >
                        <span>跳转</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-between items-center text-xs text-slate-500">
          <span>共载入 125 项功能点 · 支持跨系统、跨端独立测试</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg font-medium"
          >
            关闭矩阵
          </button>
        </div>
      </div>
    </div>
  );
};
