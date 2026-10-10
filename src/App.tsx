import React, { useState, useEffect } from 'react';
import {
  SystemId,
  FeaturePoint,
  FamilyRecord,
  AgentRecord,
  RationApplication,
  PaymentOrder,
  NotificationItem,
  CrossCheckTask,
  DiscrepancyItem,
  WarehouseStockItem,
  WarehouseFlowOrder,
  FraudAlertItem,
  UserProfile,
  ScienceInspectionItem
} from './types';
import { SYSTEMS_META } from './data/featuresRegistry';
import {
  INITIAL_FAMILIES,
  INITIAL_AGENTS,
  INITIAL_APPLICATIONS,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CROSS_CHECK_TASKS,
  INITIAL_DISCREPANCIES,
  INITIAL_WAREHOUSE_STOCKS,
  INITIAL_WAREHOUSE_FLOWS,
  INITIAL_FRAUD_ALERTS,
  INITIAL_SCIENCE_INSPECTIONS
} from './data/mockData';

import { TopNav } from './components/TopNav';
import { FeaturesMatrixModal } from './components/FeaturesMatrixModal';

// Subsystems
import { CitizenFamilySystem } from './systems/citizenFamily/CitizenFamilySystem';
import { RationingSystem } from './systems/rationing/RationingSystem';
import { IdentitySystem } from './systems/identity/IdentitySystem';
import { AgentMgmtSystem } from './systems/agentMgmt/AgentMgmtSystem';
import { EPaymentSystem } from './systems/ePayment/EPaymentSystem';
import { NotificationSystem } from './systems/notification/NotificationSystem';
import { CrossVerifySystem } from './systems/crossVerify/CrossVerifySystem';
import { WarehouseSystem } from './systems/warehouse/WarehouseSystem';
import { OperationsSystem } from './systems/operations/OperationsSystem';
import { MobileAppSystem } from './systems/mobileApp/MobileAppSystem';
import { AiBigDataSystem } from './systems/aiBigData/AiBigDataSystem';
import { ConfigMgmtSystem } from './systems/configMgmt/ConfigMgmtSystem';
import { LoginPage } from './components/LoginPage';
import { Language, TRANSLATIONS, I18nContext } from './i18n/translations';

// Firebase Auth & Firestore
import {
  auth,
  loginWithGoogle,
  logoutUser,
  syncUserProfile,
  onAuthStateChanged,
  db,
  collection,
  onSnapshot,
  setDoc,
  doc
} from './lib/firebase';

import {
  Layers,
  Server,
  Globe,
  Radio,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [currentSystemId, setCurrentSystemId] = useState<SystemId>('citizenFamily');
  const [standaloneMode, setStandaloneMode] = useState<boolean>(false);
  const [activeFeatureId, setActiveFeatureId] = useState<number | undefined>(undefined);
  const [matrixOpen, setMatrixOpen] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('iraq_ration_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      uid: 'officer-iraq-8019',
      email: 'inspector@ration.gov.iq',
      displayName: '塔里克·卡西姆配给督察官',
      photoURL: '',
      role: 'admin'
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('iraq_ration_authenticated') === 'true';
  });

  // Internationalization State (Chinese / Arabic)
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('iraq_ration_lang') as Language) || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('iraq_ration_lang', lang);
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Shared Reactive State across Subsystems
  const [families, setFamilies] = useState<FamilyRecord[]>(INITIAL_FAMILIES);
  const [agents, setAgents] = useState<AgentRecord[]>(INITIAL_AGENTS);
  const [applications, setApplications] = useState<RationApplication[]>(INITIAL_APPLICATIONS);
  const [orders, setOrders] = useState<PaymentOrder[]>(INITIAL_ORDERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [crossTasks, setCrossTasks] = useState<CrossCheckTask[]>(INITIAL_CROSS_CHECK_TASKS);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyItem[]>(INITIAL_DISCREPANCIES);
  const [stocks, setStocks] = useState<WarehouseStockItem[]>(INITIAL_WAREHOUSE_STOCKS);
  const [flows, setFlows] = useState<WarehouseFlowOrder[]>(INITIAL_WAREHOUSE_FLOWS);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlertItem[]>(INITIAL_FRAUD_ALERTS);
  const [scienceInspections, setScienceInspections] = useState<ScienceInspectionItem[]>(INITIAL_SCIENCE_INSPECTIONS);

  // Sync Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || 'user@ration.gov.iq',
          displayName: user.displayName || '伊拉克配给卡用户',
          photoURL: user.photoURL || undefined,
          role: 'citizen'
        };
        setCurrentUser(profile);
        try {
          await syncUserProfile(user, 'citizen');
        } catch (e) {
          // ignore error if offline
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore Families Collection for persistence
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'families'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteFamilies: FamilyRecord[] = [];
          snapshot.docs.forEach((docSnap) => {
            remoteFamilies.push(docSnap.data() as FamilyRecord);
          });
          if (remoteFamilies.length > 0) {
            setFamilies(prev => {
              const merged = [...remoteFamilies];
              prev.forEach(p => {
                if (!merged.find(m => m.rationCardNo === p.rationCardNo)) {
                  merged.push(p);
                }
              });
              return merged;
            });
          }
        }
      }, (err) => {
        console.warn('Firestore families listener:', err.message);
      });
      return () => unsubscribe();
    } catch (e) {
      // offline fallback
    }
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('iraq_ration_authenticated', 'true');
    localStorage.setItem('iraq_ration_user', JSON.stringify(user));
  };

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || 'citizen@ration.gov.iq',
          displayName: user.displayName || 'Google 配给专员',
          photoURL: user.photoURL || undefined,
          role: 'citizen'
        };
        handleLoginSuccess(profile);
      }
    } catch (err: any) {
      console.warn('Google login popup error:', err);
      // Demo login fallback if popup is blocked
      handleLoginSuccess({
        uid: 'usr-guest-' + Date.now().toString().slice(-4),
        email: 'citizen.baghdad@gov.iq',
        displayName: '巴格达配给督办官',
        role: 'admin'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('iraq_ration_authenticated');
    localStorage.removeItem('iraq_ration_user');
  };

  const handleRoleChange = (role: UserProfile['role']) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const currentMeta = SYSTEMS_META.find(s => s.id === currentSystemId) || SYSTEMS_META[0];

  // Updaters with Firestore Persistence
  const handleUpdateFamily = (updated: FamilyRecord) => {
    setFamilies(prev => prev.map(f => f.rationCardNo === updated.rationCardNo ? updated : f));
    // Persist to Firestore
    try {
      setDoc(doc(db, 'families', updated.rationCardNo), updated, { merge: true }).catch(() => {});
    } catch (e) {
      // offline
    }
  };

  const handleAddFamily = (newF: FamilyRecord) => {
    setFamilies(prev => [newF, ...prev]);
    try {
      setDoc(doc(db, 'families', newF.rationCardNo), newF, { merge: true }).catch(() => {});
    } catch (e) {
      // offline
    }
  };

  const handleAddApplication = (newApp: RationApplication) => {
    setApplications(prev => [newApp, ...prev]);
  };

  const handleUpdateApplication = (updatedApp: RationApplication) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
  };

  const handleUpdateAgent = (updatedAgent: AgentRecord) => {
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
  };

  const handleAddAgent = (newA: AgentRecord) => {
    setAgents(prev => [newA, ...prev]);
  };

  const handleAddOrder = (newO: PaymentOrder) => {
    setOrders(prev => [newO, ...prev]);
  };

  const handleUpdateOrder = (updatedO: PaymentOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedO.id ? updatedO : o));
  };

  const handleAddNotification = (newN: NotificationItem) => {
    setNotifications(prev => [newN, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleTriggerCrossTask = (taskId: string) => {
    setCrossTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      lastRun: new Date().toISOString().replace('T', ' ').slice(0, 19),
      discrepancyCount: t.discrepancyCount + 2
    } : t));
  };

  const handleExecuteDiscrepancy = (id: string, action: string) => {
    setDiscrepancies(prev => prev.map(d => d.id === id ? {
      ...d,
      handledStatus: action as any
    } : d));
  };

  const handleAddStock = (newS: WarehouseStockItem) => {
    setStocks(prev => [newS, ...prev]);
  };

  const handleAddFlow = (newF: WarehouseFlowOrder) => {
    setFlows(prev => [newF, ...prev]);
  };

  const handleUpdateAlert = (updatedAlert: FraudAlertItem) => {
    setFraudAlerts(prev => prev.map(a => a.id === updatedAlert.id ? updatedAlert : a));
  };

  const handleAddScienceInspection = (newI: ScienceInspectionItem) => {
    setScienceInspections(prev => [newI, ...prev]);
  };

  // Jump from 125 matrix modal
  const handleSelectFeatureFromMatrix = (feature: FeaturePoint) => {
    setCurrentSystemId(feature.systemId);
    setActiveFeatureId(feature.id);
  };

  const handleRegisterNewFamily = (newFamily: FamilyRecord) => {
    setFamilies(prev => [newFamily, ...prev]);
    try {
      setDoc(doc(db, 'families', newFamily.rationCardNo), newFamily);
    } catch (e) {
      // offline fallback
    }
  };

  // If not authenticated, display the official Iraqi Digital Ration Card LoginPage
  if (!isAuthenticated) {
    return (
      <I18nContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang], isRtl: false }}>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onRegisterFamily={handleRegisterNewFamily}
          currentLang={lang}
          onLanguageChange={setLang}
        />
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang], isRtl: false }}>
      <div
        dir="ltr"
        className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans"
      >
        {/* Global Top Nav - Clean Single Layer with Language Switcher */}
        <TopNav
          currentSystemId={currentSystemId}
          standaloneMode={standaloneMode}
          onSelectSystem={id => {
            setCurrentSystemId(id);
            setActiveFeatureId(undefined);
          }}
          onExitStandalone={() => setStandaloneMode(false)}
          onOpenMatrix={() => setMatrixOpen(true)}
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onRoleChange={handleRoleChange}
          currentLang={lang}
          onLanguageChange={setLang}
        />

      {/* Main Subsystem Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 py-3.5 sm:px-6 sm:py-6 lg:px-8 overflow-x-hidden">
        {currentSystemId === 'citizenFamily' && (
          <CitizenFamilySystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            familyData={families}
            applications={applications}
            onUpdateFamily={handleUpdateFamily}
            onAddFamily={handleAddFamily}
            onAddApplication={handleAddApplication}
            onUpdateApplication={handleUpdateApplication}
          />
        )}

        {currentSystemId === 'rationing' && (
          <RationingSystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            familyData={families}
            agentData={agents}
            applications={applications}
            onAddApplication={handleAddApplication}
            onUpdateApplication={handleUpdateApplication}
            onUpdateFamily={handleUpdateFamily}
          />
        )}

        {currentSystemId === 'identity' && (
          <IdentitySystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            familyData={families}
            onUpdateFamily={handleUpdateFamily}
          />
        )}

        {currentSystemId === 'agentMgmt' && (
          <AgentMgmtSystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            agentData={agents}
            familyData={families}
            onUpdateAgent={handleUpdateAgent}
            onAddAgent={handleAddAgent}
          />
        )}

        {currentSystemId === 'ePayment' && (
          <EPaymentSystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            orders={orders}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
          />
        )}

        {currentSystemId === 'notification' && (
          <NotificationSystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            notifications={notifications}
            onAddNotification={handleAddNotification}
            onMarkRead={handleMarkNotificationRead}
          />
        )}

        {currentSystemId === 'crossVerify' && (
          <CrossVerifySystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            tasks={crossTasks}
            discrepancies={discrepancies}
            onTriggerTask={handleTriggerCrossTask}
            onExecuteDiscrepancyAction={handleExecuteDiscrepancy}
          />
        )}

        {currentSystemId === 'warehouse' && (
          <WarehouseSystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            stocks={stocks}
            flows={flows}
            onAddStock={handleAddStock}
            onAddFlow={handleAddFlow}
          />
        )}

        {currentSystemId === 'operations' && (
          <OperationsSystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            familyData={families}
            applications={applications}
            onUpdateApplication={handleUpdateApplication}
          />
        )}

        {currentSystemId === 'mobileApp' && (
          <MobileAppSystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            familyData={families}
            agentData={agents}
            applications={applications}
          />
        )}

        {currentSystemId === 'aiBigData' && (
          <AiBigDataSystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            alerts={fraudAlerts}
            onUpdateAlert={handleUpdateAlert}
            currentUser={currentUser}
            scienceInspections={scienceInspections}
            onAddScienceInspection={handleAddScienceInspection}
          />
        )}

        {currentSystemId === 'configMgmt' && (
          <ConfigMgmtSystem
            standalone={standaloneMode}
            activeFeatureId={activeFeatureId}
            currentUser={currentUser}
            onSelectSystem={id => {
              setCurrentSystemId(id);
              setActiveFeatureId(undefined);
            }}
            onLaunchStandalone={id => {
              setCurrentSystemId(id);
              setStandaloneMode(true);
            }}
          />
        )}
      </main>

      {/* 125 Items Matrix Modal */}
      <FeaturesMatrixModal
        isOpen={matrixOpen}
        onClose={() => setMatrixOpen(false)}
        onSelectFeature={handleSelectFeatureFromMatrix}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>伊拉克共和国贸易部食品配给署 · 国家数字配给卡综合服务平台</span>
            <span className="text-emerald-500 font-mono">● Firebase 实时数据持久化</span>
          </div>
          <div className="text-slate-500 font-mono">
            © 2026 Republic of Iraq · Ministry of Trade
          </div>
        </div>
      </footer>
    </div>
    </I18nContext.Provider>
  );
}
