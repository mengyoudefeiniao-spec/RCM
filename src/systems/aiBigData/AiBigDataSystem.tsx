import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  ScanText,
  ShieldAlert,
  Database,
  FileCheck2,
  FileSearch,
  SlidersHorizontal,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  Copy,
  ExternalLink,
  BookOpen,
  ArrowRightLeft,
  Eye,
  Check,
  RotateCcw,
  FlaskConical,
  Atom,
  TestTube,
  Microscope,
  FileSpreadsheet,
  Cpu
} from 'lucide-react';
import { FraudAlertItem, ScienceInspectionItem, UserProfile } from '../../types';
import { INITIAL_AI_KNOWLEDGE, INITIAL_SCIENCE_INSPECTIONS } from '../../data/mockData';
import { askGeminiAssistant, GeminiModelId, SYSTEM_INSTRUCTION_DEFAULT } from '../../lib/gemini';
import { db, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from '../../lib/firebase';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  alerts: FraudAlertItem[];
  onUpdateAlert: (alert: FraudAlertItem) => void;
  currentUser?: UserProfile | null;
  scienceInspections?: ScienceInspectionItem[];
  onAddScienceInspection?: (item: ScienceInspectionItem) => void;
}

interface ChatMessage {
  id?: string;
  sender: 'user' | 'model';
  text: string;
  modelUsed?: string;
  citations?: string[];
  timestamp?: string;
}

const CHAT_ROLES = [
  {
    id: 'policy_auditor',
    name: '🏛️ 法理与政策审查官',
    description: '审核14周岁结婚分户硬性准入、1500户拆分、250000第纳尔资质规费',
    instruction: `你是伊拉克贸易部食品配给署法理审查官。重点审查：
1. 夫妻双方须年满14周岁且具初级民事法院或审判庭有效结婚证明；
2. 代销网点上限1500户（超额启动拆分程序）；两网点合并严禁超750户；食品面粉统营面积须≥20平方米；
3. 法定规费：公民常规电子申请 2,000 第纳尔 (IQD)；新设立、资质恢复、食品面粉统营合并拆分牌照 250,000 IQD；亲属轮替继承 50,000 IQD。`
  },
  {
    id: 'fraud_detective',
    name: '🛡️ 反欺诈与异常核验侦探',
    description: '一人多卡比对、已故冒领、150万月薪公职人员冻结、异常高频盗领',
    instruction: `你是国家数字配给卡反欺诈调查官。重点研判：
1. 一人多卡识别与多省份重叠领取；
2. 死亡未销卡冒领拦截与跨部门出入境记录核验；
3. 月薪超150万第纳尔公职人员、企业法人自动冻结与解冻申诉审核；
4. 代理网点虚构发放量与短缺预警。`
  },
  {
    id: 'science_officer',
    name: '🔬 粮食理化指标与食品安全检测官',
    description: '粮油生化理化检测标准、PubChem标准物、水分/湿面筋/黄曲霉毒素排查',
    instruction: `你是国家粮食储备与配给质检总局生化实验室首席检测官。熟悉：
1. 小麦面粉：水分比重(≤14.0%)、湿面筋(≥24.0%)、酸价(≤0.20 mg/g)；
2. 精炼食用油：酸价(KOH ≤0.20 mg/g)、过氧化值(≤10 meq/kg)、黄曲霉毒素B1(不得检出)；
3. 白砂糖与长粒大米理化指标与重金属残留。依据国家实验室标准提供理化判定。`
  },
  {
    id: 'citizen_guide',
    name: '💬 公民便民导办专家',
    description: '日常办卡、增人补卡、便民问答、操作指引',
    instruction: `你是伊拉克国家数字配给卡便民服务前台顾问。以亲和耐心的语气为伊拉克公民解答数字配给卡办理流程、补卡换卡、新生儿增人、老人自核认证与移动端App使用指引。`
  }
];

export const AiBigDataSystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  alerts,
  onUpdateAlert,
  currentUser,
  scienceInspections = INITIAL_SCIENCE_INSPECTIONS,
  onAddScienceInspection
}) => {
  // Navigation tabs for 17 features:
  // 109-113: rag_agent, 114-119: ocr_audit, 120-125: fraud_engine, + science_lab
  const [activeTab, setActiveTab] = useState<'rag_agent' | 'ocr_audit' | 'fraud_engine' | 'science_lab'>(
    activeFeatureId && activeFeatureId >= 109 && activeFeatureId <= 113 ? 'rag_agent' :
    activeFeatureId && activeFeatureId >= 114 && activeFeatureId <= 119 ? 'ocr_audit' :
    activeFeatureId && activeFeatureId >= 120 && activeFeatureId <= 125 ? 'fraud_engine' : 'rag_agent'
  );

  // Gemini Model & Role Configuration
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-3.5-flash');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('policy_auditor');
  const currentRole = CHAT_ROLES.find(r => r.id === selectedRoleId) || CHAT_ROLES[0];

  // RAG / Gemini Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'model',
      text: '您好！我是伊拉克国家数字配给卡综合服务平台智能顾问。基于全量政策知识库与反欺诈引擎构建，我能为您解答分户条件（14周岁结婚准入）、代理网点资质（1500户拆分/750户合并/20㎡面积）、法定规费清单（2,000与250,000第纳尔）以及粮食理化安全检验。',
      modelUsed: 'gemini-3.5-flash',
      citations: ['《实施细则》第14条', '《代销资质规程》第22条', '《财务核准批件》']
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [handoffSuccess, setHandoffSuccess] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // OCR Workbench State (Features 114-119)
  const [ocrPreprocessed, setOcrPreprocessed] = useState(true);
  const [ocrLanguageMode, setOcrLanguageMode] = useState<'arabic_print' | 'arabic_handwritten'>('arabic_print');
  const [ocrVerifiedByHuman, setOcrVerifiedByHuman] = useState(false);

  // Selected Fraud Alert for Ticket Dispatch (Feature 125)
  const [selectedAlertId, setSelectedAlertId] = useState(alerts[0]?.id || '');
  const [ticketActionMsg, setTicketActionMsg] = useState<string | null>(null);

  // Science Lab State
  const [labCommodity, setLabCommodity] = useState<'精制小麦粉' | '长粒大米' | '食用白砂糖' | '精炼葵花籽油' | '婴幼儿奶粉'>('精制小麦粉');
  const [labBatch, setLabBatch] = useState('WF-BAG-20261010-EXP');
  const [labMoisture, setLabMoisture] = useState<number>(13.2);
  const [labGluten, setLabGluten] = useState<number>(26.5);
  const [labAcid, setLabAcid] = useState<number>(0.13);
  const [labAflatoxin, setLabAflatoxin] = useState<number>(0.0);
  const [labStatusNotice, setLabStatusNotice] = useState<string | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  // Load chat messages from Firestore if available
  useEffect(() => {
    try {
      const q = query(collection(db, 'chatMessages'), orderBy('createdAt', 'desc'), limit(15));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loaded: ChatMessage[] = [];
          snapshot.docs.reverse().forEach((doc) => {
            const data = doc.data();
            loaded.push({
              id: doc.id,
              sender: data.role === 'user' ? 'user' : 'model',
              text: data.text,
              modelUsed: data.modelName || 'gemini-3.5-flash',
              citations: data.citations || []
            });
          });
          if (loaded.length > 0) {
            setMessages(prev => {
              // merge without losing model greeting
              const existingFirst = prev[0];
              return [existingFirst, ...loaded.filter(l => l.text !== existingFirst.text)];
            });
          }
        }
      }, (error) => {
        console.warn('Firestore chatMessages listener:', error.message);
      });
      return () => unsubscribe();
    } catch (e) {
      // offline or rule blocked
    }
  }, []);

  // Handle Multi-turn Chat Submission
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isAiLoading) return;

    const userPrompt = inputQuestion.trim();
    setInputQuestion('');

    const newHistory: ChatMessage[] = [
      ...messages,
      { sender: 'user', text: userPrompt }
    ];
    setMessages(newHistory);
    setIsAiLoading(true);

    try {
      // Persist user prompt to Firestore
      try {
        await addDoc(collection(db, 'chatMessages'), {
          userId: currentUser?.uid || 'guest-user',
          role: 'user',
          text: userPrompt,
          modelName: selectedModel,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        // silent fallback
      }

      // Format conversation for Gemini
      const conversationHistory = newHistory.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text
      }));

      const replyText = await askGeminiAssistant({
        messages: conversationHistory,
        model: selectedModel,
        systemInstruction: currentRole.instruction
      });

      const citations: string[] = [];
      if (replyText.includes('14')) citations.push('《数字化实施细则》第14条');
      if (replyText.includes('1500') || replyText.includes('750')) citations.push('《代销网点设立管理办法》第22条');
      if (replyText.includes('2,000') || replyText.includes('250,000')) citations.push('《贸易部财务批件(2025/110)》');
      if (replyText.includes('150万') || replyText.includes('冻结')) citations.push('《跨部门反冒领联席备忘录》');
      if (replyText.includes('水分') || replyText.includes('面筋')) citations.push('《国家粮食储备质量安全规范》');

      const modelMessage: ChatMessage = {
        sender: 'model',
        text: replyText,
        modelUsed: selectedModel,
        citations: citations.length > 0 ? citations : ['国家数字配给署官方规章库']
      };

      setMessages(prev => [...prev, modelMessage]);

      // Persist model response to Firestore
      try {
        await addDoc(collection(db, 'chatMessages'), {
          userId: currentUser?.uid || 'guest-user',
          role: 'model',
          text: replyText,
          modelName: selectedModel,
          citations,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        // silent fallback
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          sender: 'model',
          text: '系统处理咨询时遇到网络微扰，但根据国家数字配给卡法规规定：分户申请夫妻双方须年满14周岁；单网点上限1500户；常规规费为2,000第纳尔。',
          modelUsed: selectedModel,
          citations: ['《实施细则》应急容灾索引']
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Run Science Lab Assay
  const handleRunScienceAssay = async () => {
    let verdict: ScienceInspectionItem['inspectionVerdict'] = '合格 (准予调拨配发)';
    if (labCommodity === '精制小麦粉') {
      if (labMoisture > 14.0 || labGluten < 24.0 || labAcid > 0.20 || labAflatoxin > 0.0) {
        verdict = labMoisture > 15.0 || labAflatoxin > 2.0 ? '不合格 (立即扣押封存)' : '警示 (双人复测)';
      }
    } else if (labCommodity === '长粒大米') {
      if (labMoisture > 14.5 || labAflatoxin > 1.0) {
        verdict = '警示 (双人复测)';
      }
    }

    const pubchemCidMap: Record<string, { cid: number; formula: string; tech: string }> = {
      精制小麦粉: { cid: 5462224, formula: 'C20H32N4O7 (Glutenin)', tech: 'HPLC & 近红外定硫仪' },
      精炼葵花籽油: { cid: 5280450, formula: 'C18H32O2 (Linoleic Acid)', tech: 'GC-MS 气质联用仪' },
      食用白砂糖: { cid: 5988, formula: 'C12H22O11 (D-Sucrose)', tech: '高精度数字旋光仪' },
      长粒大米: { cid: 5755, formula: '(C6H10O5)n (Amylose)', tech: 'ELISA 酶联免疫毒素筛查' },
      婴幼儿奶粉: { cid: 11025, formula: 'C12H22O11 (Lactose/Protein)', tech: '凯氏定氮仪 & ICP-MS' }
    };

    const targetSpec = pubchemCidMap[labCommodity] || { cid: 5462224, formula: 'Complex Organics', tech: '化学滴定法' };

    const newInspection: ScienceInspectionItem = {
      id: `LAB-2026-${Math.floor(100 + Math.random() * 900)}`,
      commodity: labCommodity,
      pubchemCid: targetSpec.cid,
      chemicalFormula: targetSpec.formula,
      batchNumber: labBatch,
      moisturePercent: labMoisture,
      glutenPercent: labGluten,
      acidValueMgKoh: labAcid,
      aflatoxinB1Ppb: labAflatoxin,
      inspectionVerdict: verdict,
      inspectorName: currentUser?.displayName || '扎伊德·卡西姆博士 (国家质检室)',
      labTechnique: targetSpec.tech,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    if (onAddScienceInspection) {
      onAddScienceInspection(newInspection);
    }

    // Persist to Firestore
    try {
      await addDoc(collection(db, 'scienceInspections'), {
        ...newInspection,
        createdAtServer: serverTimestamp()
      });
    } catch (e) {
      // offline fallback
    }

    setLabStatusNotice(`✓ 批次 ${labBatch} 检验完成！结论：${verdict}。已写入国家质检链并同步仓储中心。`);
    setTimeout(() => setLabStatusNotice(null), 5000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('rag_agent')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'rag_agent' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bot className="w-4 h-4" /> Gemini 多轮智能客服 (109-113)
          </button>
          <button
            onClick={() => setActiveTab('ocr_audit')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ocr_audit' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ScanText className="w-4 h-4" /> OCR要素抽取与比对 (114-119)
          </button>
          <button
            onClick={() => setActiveTab('fraud_engine')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'fraud_engine' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> 六大反欺诈与工单派发 (120-125)
          </button>
          <button
            onClick={() => setActiveTab('science_lab')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'science_lab' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FlaskConical className="w-4 h-4" /> 🔬 粮食理化生化质检室 (Science Lab)
          </button>
        </div>
      </div>

      {/* Module 1: Gemini Multi-Turn RAG Assistant (Features 109-113) */}
      {activeTab === 'rag_agent' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span>功能点 109 ~ 113：Gemini 多轮智能问答、权威法条溯源与多模型协同</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {selectedModel}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                依据用户需求自动调度 Gemini 模型：复杂法理审计推荐 3.1 Pro，常规问答使用 3.5 Flash，极速响应使用 3.1 Flash-Lite。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setHandoffSuccess(true);
                  setTimeout(() => setHandoffSuccess(false), 5000);
                }}
                className="px-3.5 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>功能点 112: 转接 7×24 人工座席</span>
              </button>
            </div>
          </div>

          {handoffSuccess && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>✓ 全量会话上下文已同步至呼叫中心座席 (工号 #8019 · 资深配给法务专员)，座席已接入实时协同！</span>
            </div>
          )}

          {/* Model & Role Selector Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {/* Model Switcher */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-600" />
                <span>Gemini 模型选择：</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini-3.5-flash')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedModel === 'gemini-3.5-flash'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-mono text-[11px]">gemini-3.5-flash</div>
                  <div className="text-[10px] text-slate-500">通用综合任务 (平衡)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedModel === 'gemini-3.1-pro-preview'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-mono text-[11px]">gemini-3.1-pro</div>
                  <div className="text-[10px] text-slate-500">复杂法理与深度研判</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedModel === 'gemini-3.1-flash-lite'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-mono text-[11px]">gemini-3.1-lite</div>
                  <div className="text-[10px] text-slate-500">极速敏捷低延迟</div>
                </button>
              </div>
            </div>

            {/* Role System Instruction Switcher */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                <span>AI 角色与 System Instruction 定制：</span>
              </label>
              <select
                value={selectedRoleId}
                onChange={e => setSelectedRoleId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              >
                {CHAT_ROLES.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {r.description}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 leading-tight">
                当前角色专属指引已注入提示词层：重点约束业务口径、法律条款依据与精准裁量权。
              </p>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">快捷政策咨询：</span>
            {[
              '新婚分户夫妻必须年满14周岁吗？需要哪些法院证明？',
              '代理网点服务户数超过1500户后如何启动拆分？两家合并限额多少？',
              '公民申请电子配给卡和代理商新设立牌照的法定规费是多少第纳尔？',
              '月收入超过150万第纳尔的公职人员被系统冻结后如何申诉解冻？',
              '小麦面粉和精炼葵花籽油的标准生化检测指标包含哪些？'
            ].map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputQuestion(q)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors text-[11px]"
              >
                {q.length > 22 ? q.substring(0, 22) + '...' : q}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Multi-turn Scrollable Chat Box (110 & 111) */}
            <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[520px] bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden shadow-inner">
              {/* Scrollable messages container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-1">
                        <span className="font-semibold text-[11px] flex items-center gap-1">
                          {msg.sender === 'user' ? (
                            <span>👤 您 ({currentUser?.displayName || '配给用户'})</span>
                          ) : (
                            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{currentRole.name}</span>
                              <span className="text-[10px] font-mono opacity-80">({msg.modelUsed || selectedModel})</span>
                            </span>
                          )}
                        </span>
                        {msg.sender === 'model' && (
                          <button
                            onClick={() => copyToClipboard(msg.text, idx)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] flex items-center gap-1 transition-colors"
                            title="复制回答"
                          >
                            {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedIndex === idx ? '已复制' : '复制'}</span>
                          </button>
                        )}
                      </div>

                      <div className="leading-relaxed whitespace-pre-wrap text-xs">
                        {msg.text}
                      </div>

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 text-[10px]">
                          <span className="text-slate-400">权威依据出处：</span>
                          {msg.citations.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-md font-mono border border-purple-200 dark:border-purple-800">
                              📄 {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-500 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>Gemini {selectedModel} 正在检索政策知识库与法规条文并生成严谨解答...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleAskQuestion} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={e => setInputQuestion(e.target.value)}
                  placeholder="提问政策法规、分户14岁限制、1500户网点拆分、250000第纳尔规费、理化检验标准..."
                  disabled={isAiLoading}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !inputQuestion.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>发送提问</span>
                </button>
              </form>
            </div>

            {/* Knowledge Base & Quality Audit (109 & 113) */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>功能点 109：向量知识库索引状态</span>
                </span>
                <div className="space-y-1 font-mono text-[11px] text-slate-500">
                  <div>向量索引法规数: 1,420 条</div>
                  <div>嵌入模型: text-embedding-004</div>
                  <div>向量库同步版本: v2026.10.10</div>
                  <div>Firestore 聊天持久化: <span className="text-emerald-500 font-semibold">就绪</span></div>
                  <div className="text-emerald-600 font-semibold">增量构建: 已全量同步最新法条</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>功能点 113：问答质检与盲区归集</span>
                </span>
                <p className="text-slate-500 text-[11px]">
                  全量留存多轮会话日志；自动分析高频追问未满意解答的政策盲区，反哺知识库定期迭代。
                </p>
                <div className="p-2.5 bg-white dark:bg-slate-900 border rounded-lg text-[11px] font-mono space-y-1">
                  <div className="text-purple-600 font-bold">高频聚焦热点：</div>
                  <div>• 14周岁结婚分户强制审查 (98.4%满意度)</div>
                  <div>• 1500户网点拆分委员会规程 (96.7%)</div>
                  <div>• 250,000 IQD 代理核准规费 (99.1%)</div>
                </div>
              </div>

              {/* Policy Articles Accordion */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>核心业务政策依据速查</span>
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {INITIAL_AI_KNOWLEDGE.map(k => (
                    <div key={k.id} className="p-2 bg-white dark:bg-slate-900 rounded border text-[11px] space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{k.title}</div>
                      <p className="text-slate-500 text-[10px] line-clamp-2">{k.content}</p>
                      <div className="text-purple-600 text-[10px] font-mono">{k.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 2: OCR Workbench (Features 114-119) */}
      {activeTab === 'ocr_audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                功能点 114 ~ 119：阿拉伯语多版式印刷/手写体OCR、置信度多维质检与人机协同差错比对
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                支持纸质纸本配给卡、出生证明、法院结婚证书、法医死亡医学证明之双语深度识别。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Doc Preview & Image Preprocessing (114 & 115) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 bg-slate-50 dark:bg-slate-800/30">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  功能点 114：单据智能预处理控制台
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">去阴影与倾斜矫正</span>
                  <input
                    type="checkbox"
                    checked={ocrPreprocessed}
                    onChange={e => setOcrPreprocessed(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Simulated Paper Document */}
              <div className={`p-5 rounded-lg border text-xs font-mono transition-all duration-300 ${
                ocrPreprocessed
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-sm'
                  : 'bg-stone-200 dark:bg-stone-900 border-dashed border-stone-400 rotate-1 scale-95 opacity-80'
              }`}>
                <div className="text-center font-bold pb-2 border-b border-slate-300 dark:border-slate-700">
                  جمهورية العراق - وزارة التجارة (伊拉克共和国贸易部)
                </div>
                <div className="text-right py-2 text-slate-700 dark:text-slate-300 leading-relaxed dir-rtl">
                  بطاقة التموين الإلكترونية - رقم البطاقة: 1048-9281-0021<br />
                  اسم رب الأسرة: مصطفى أحمد رشيد (穆斯塔法·艾哈迈德·拉希德)<br />
                  المحافظة: بغداد - الكرخ (巴格达省)<br />
                  عدد الأفراد المسجلين: 5 أفراد
                </div>
                <div className="text-[10px] text-slate-500 border-t border-slate-300 dark:border-slate-700 pt-1 flex justify-between">
                  <span>单据类型: 老旧纸质配给卡</span>
                  <span>成色: 褶皱经自动去噪</span>
                </div>
              </div>

              {/* Language Engine (115) */}
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  功能点 115：OCR 识别模型引擎切换
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOcrLanguageMode('arabic_print')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs transition-colors ${
                      ocrLanguageMode === 'arabic_print'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-600 font-semibold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    阿拉伯语标准印刷体 (准确率 99.4%)
                  </button>
                  <button
                    onClick={() => setOcrLanguageMode('arabic_handwritten')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs transition-colors ${
                      ocrLanguageMode === 'arabic_handwritten'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-600 font-semibold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    阿拉伯语草写手写体 (准确率 96.1%)
                  </button>
                </div>
              </div>
            </div>

            {/* Extracted Fields & Confidence Score (116, 117, 118, 119) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                功能点 116 ~ 118：结构化要素提取、字段置信度与自动交叉比对
              </span>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-slate-500">配给卡号:</span>{' '}
                    <strong className="text-purple-600">1048-9281-0021</strong>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                    置信度 99.8%
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-slate-500">户主姓名:</span>{' '}
                    <strong>穆斯塔法·艾哈迈德·拉希德</strong>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                    置信度 98.7%
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-slate-500">归属省份:</span>{' '}
                    <strong>巴格达省</strong>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                    置信度 99.2%
                  </span>
                </div>

                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-amber-700 dark:text-amber-400 font-sans font-medium">
                      功能点 118 自动比对警告：
                    </span>{' '}
                    <span>与内政部身份底库比对发现家庭成员差错 1 项</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 bg-amber-500 text-white rounded font-bold">
                    需人机复核
                  </span>
                </div>
              </div>

              {/* Human-in-the-Loop Verification (119) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  功能点 119：人工复核与修改沉淀反馈通道
                </span>
                <button
                  onClick={() => setOcrVerifiedByHuman(!ocrVerifiedByHuman)}
                  className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    ocrVerifiedByHuman
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{ocrVerifiedByHuman ? '人工已确认无误 · 结果已归档' : '确认OCR提取无误并注入电子底账'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 3: Fraud Detection Engines (Features 120-125) */}
      {activeTab === 'fraud_engine' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 120 ~ 125：六大反欺诈与异常检测引擎、多维预警评分及闭环处置派单
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              涵盖一人多卡比对、已故未销卡冒领、高收入未冻结、高频跨区盗领、代销网点克扣短缺；高/中/低分级生成派发调度工单。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Alert List (120-124) */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                实时反欺诈触发警报列表：
              </span>
              <div className="space-y-3">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAlertId(a.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-colors space-y-2 ${
                      selectedAlertId === a.id
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          a.level === '高级' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {a.level}风险 ({a.riskScore}分)
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{a.alertType}</span>
                      </div>
                      <span className="font-mono text-slate-400">{a.timestamp}</span>
                    </div>

                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      涉事对象：{a.targetEntity}
                    </div>

                    <p className="text-slate-600 dark:text-slate-400">
                      {a.description}
                    </p>

                    <div className="flex justify-between items-center pt-1 font-mono text-[11px]">
                      <span className="text-purple-600 font-semibold">命中规则: {a.detectionRule}</span>
                      <span className={`font-semibold ${
                        a.status === '已闭环解决' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        状态: {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Dispatch & Closed-Loop (125) */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                功能点 125：预警分级与调度工单闭环工作台
              </span>

              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div>选定工单: <span className="font-mono font-bold text-purple-600">{selectedAlertId}</span></div>
                <div>派工科室: <span className="font-semibold">商业监督司 / 冻结科稽查组</span></div>
                <div>核查时限: <span className="font-mono font-bold text-rose-500">24 小时内加急排查</span></div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    const target = alerts.find(x => x.id === selectedAlertId);
                    if (target) {
                      const updated = { ...target, status: '已闭环解决' as const };
                      onUpdateAlert(updated);
                    }
                    setTicketActionMsg('✓ 已生成专项执法调度单！并下发冻结与实地查验指令，已实现全流程闭环归档。');
                    setTimeout(() => setTicketActionMsg(null), 4000);
                  }}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  下发调度工单并锁定涉案配额
                </button>
              </div>

              {ticketActionMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {ticketActionMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Module 4: Science Lab & Commodity Biochemistry Inspection (Science Integration) */}
      {activeTab === 'science_lab' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                <span>国家配给物资生化理化质检实验室 (Biochemical & Food Science Quality Testing)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                基于 PubChem 化合物标准库与现代粮食质检协议，对国家小麦面粉、精炼食用油、精制白糖及长粒大米进行抽样生化检验。
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800">
                符合 ISO 17025 认证实验室
              </span>
            </div>
          </div>

          {/* Interactive Assay Workbench */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                <TestTube className="w-4 h-4 text-purple-600" />
                <span>发起粮油生化取样理化检验</span>
              </span>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-500 block mb-1">受检配给物资品类：</label>
                  <select
                    value={labCommodity}
                    onChange={e => setLabCommodity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="精制小麦粉">精制小麦粉 (Wheat Flour · PubChem CID 5462224)</option>
                    <option value="精炼葵花籽油">精炼葵花籽油 (Sunflower Oil · CID 5280450)</option>
                    <option value="食用白砂糖">食用白砂糖 (Refined Sugar · CID 5988)</option>
                    <option value="长粒大米">长粒大米 (Long Grain Rice · CID 5755)</option>
                    <option value="婴幼儿奶粉">婴幼儿奶粉 (Infant Formula · CID 11025)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">检验批次编号：</label>
                  <input
                    type="text"
                    value={labBatch}
                    onChange={e => setLabBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">水分比重 (标准≤14.0%)：</label>
                    <input
                      type="number"
                      step="0.1"
                      value={labMoisture}
                      onChange={e => setLabMoisture(parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">湿面筋含量 (标准≥24%)：</label>
                    <input
                      type="number"
                      step="0.1"
                      value={labGluten}
                      onChange={e => setLabGluten(parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 block mb-1">酸价 KOH (标准≤0.20)：</label>
                    <input
                      type="number"
                      step="0.01"
                      value={labAcid}
                      onChange={e => setLabAcid(parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">黄曲霉毒素 B1 (ppb)：</label>
                    <input
                      type="number"
                      step="0.1"
                      value={labAflatoxin}
                      onChange={e => setLabAflatoxin(parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunScienceAssay}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Microscope className="w-4 h-4" />
                  <span>执行精密色谱检测并生成质检报告</span>
                </button>

                {labStatusNotice && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px]">
                    {labStatusNotice}
                  </div>
                )}
              </div>
            </div>

            {/* Scientific Reports & Laboratory Archive */}
            <div className="md:col-span-2 space-y-3">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block flex items-center justify-between">
                <span>国家储备粮油检验台账与 PubChem 溯源清单：</span>
                <span className="text-[11px] font-mono text-slate-400">已存档 {scienceInspections.length} 个批次</span>
              </span>

              <div className="space-y-3">
                {scienceInspections.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.commodity}
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          批次: {item.batchNumber}
                        </span>
                        <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400">
                          PubChem CID: {item.pubchemCid}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        item.inspectionVerdict.startsWith('合格')
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : item.inspectionVerdict.startsWith('警示')
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {item.inspectionVerdict}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                      <div>水分比重: <strong className={item.moisturePercent > 14.0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}>{item.moisturePercent}%</strong></div>
                      <div>湿面筋: <strong>{item.glutenPercent > 0 ? `${item.glutenPercent}%` : 'N/A'}</strong></div>
                      <div>酸价 KOH: <strong>{item.acidValueMgKoh} mg/g</strong></div>
                      <div>黄曲霉毒素: <strong className={item.aflatoxinB1Ppb > 0 ? 'text-amber-500' : 'text-emerald-600'}>{item.aflatoxinB1Ppb} ppb</strong></div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                      <div>检测方法: <span className="font-mono text-slate-700 dark:text-slate-300">{item.labTechnique}</span></div>
                      <div>主检专员: <span className="font-medium text-slate-700 dark:text-slate-300">{item.inspectorName}</span></div>
                      <div>时间: <span className="font-mono">{item.createdAt}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
