import React from 'react';
import { SystemId, FeaturePoint } from '../types';
import { SYSTEMS_META } from '../data/featuresRegistry';
import { Globe, Server, CheckCircle2, ExternalLink, ShieldCheck, Layers } from 'lucide-react';

interface Props {
  currentSystemId: SystemId;
  standaloneMode: boolean;
  onSelectSystem: (id: SystemId) => void;
  onToggleStandalone: (standalone: boolean) => void;
  onOpenMatrix: () => void;
}

export const DeploymentBar: React.FC<Props> = ({
  currentSystemId,
  standaloneMode,
  onSelectSystem,
  onToggleStandalone,
  onOpenMatrix
}) => {
  const currentMeta = SYSTEMS_META.find(s => s.id === currentSystemId) || SYSTEMS_META[0];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Deployment Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">部署状态:</span>
            <span className="text-emerald-400 font-semibold">独立微前端 Pod 运行中</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>端口: <strong className="text-white">{currentMeta.deployPort}</strong></span>
            <span className="text-slate-600">/</span>
            <span>域名: <strong className="text-white">{currentMeta.domain}</strong></span>
          </div>
        </div>

        {/* Right: Switch Mode & 125 Items Matrix Launcher */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onToggleStandalone(false)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                !standaloneMode
                  ? 'bg-slate-700 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              统一网关控制台
            </button>
            <button
              onClick={() => onToggleStandalone(true)}
              className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                standaloneMode
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>独立隔离部署视图</span>
            </button>
          </div>

          {/* Quick Matrix Modal Button */}
          <button
            onClick={onOpenMatrix}
            className="px-3.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>125项功能点全景</span>
          </button>
        </div>
      </div>

      {/* Subsystem Deployment Selector Bar */}
      <div className="border-t border-slate-800/60 bg-slate-950/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-1 min-w-max">
          <span className="text-[11px] text-slate-500 whitespace-nowrap mr-2 font-mono">子系统独立部署路由:</span>
          {SYSTEMS_META.map(sys => {
            const isActive = sys.id === currentSystemId;
            return (
              <button
                key={sys.id}
                onClick={() => onSelectSystem(sys.id)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="font-mono text-[10px] text-slate-500">{sys.code.split('-')[1]}</span>
                <span>{sys.name}</span>
                <span className="text-[10px] font-mono px-1 py-0.2 bg-slate-900 rounded text-slate-400">
                  {sys.featureCount}项
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
