import React, { useState } from 'react';
import {
  ScanFace,
  Nfc,
  Share2,
  KeyRound,
  ShieldAlert,
  MapPin,
  AlertTriangle,
  Archive,
  CheckCircle2,
  Camera,
  RefreshCw,
  Copy,
  Check,
  Smartphone
} from 'lucide-react';
import { FamilyRecord } from '../../types';
import { RemoteVerificationModal } from '../../components/RemoteVerificationModal';
import { useI18n } from '../../i18n/translations';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  familyData: FamilyRecord[];
  onUpdateFamily: (family: FamilyRecord) => void;
}

export const IdentitySystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  familyData,
  onUpdateFamily
}) => {
  const currentFamily = familyData[0];

  // 8 tabs matching features 19-26:
  // 19: face_match, 20: unified_card_nfc, 21: share_link, 22: code_verify,
  // 23: anti_spoofing, 24: geo_check, 25: geo_anomaly, 26: archive_logs
  const [activeTab, setActiveTab] = useState<string>(
    activeFeatureId === 19 ? 'face_match' :
    activeFeatureId === 20 ? 'unified_card_nfc' :
    activeFeatureId === 21 ? 'share_link' :
    activeFeatureId === 22 ? 'code_verify' :
    activeFeatureId === 23 ? 'anti_spoofing' :
    activeFeatureId === 24 ? 'geo_check' :
    activeFeatureId === 25 ? 'geo_anomaly' :
    activeFeatureId === 26 ? 'archive_logs' : 'face_match'
  );

  // Feature 19 State: Face Match
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceResult, setFaceResult] = useState<{ match: boolean; confidence: number; name: string } | null>(null);

  // Feature 20 State: NFC Reading
  const [nfcReading, setNfcReading] = useState(false);
  const [nfcCardData, setNfcCardData] = useState<{
    cardSerial: string;
    nationalId: string;
    fullName: string;
    chipVersion: string;
  } | null>(null);

  // Feature 21 State: Share Link
  const { lang, t } = useI18n();
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);
  const [selectedRemoteMemberId, setSelectedRemoteMemberId] = useState<string>(
    currentFamily.members[1]?.id || currentFamily.members[0]?.id || ''
  );
  const [remotePersonName, setRemotePersonName] = useState('');
  const [remotePersonLocation, setRemotePersonLocation] = useState<'same' | 'basra' | 'erbil' | 'mosul'>('erbil');
  const [remoteRejectionNotice, setRemoteRejectionNotice] = useState<{
    status: 'success' | 'rejected_name' | 'rejected_location';
    message: string;
  } | null>(null);

  const [generatedLink, setGeneratedLink] = useState<string | null>(
    `https://m.rationcard.gov.iq/verify-remote?session=SESS-9812&code=839201&card=${currentFamily.rationCardNo}`
  );
  const [generatedOtp, setGeneratedOtp] = useState<string | null>('839201');
  const [copiedLink, setCopiedLink] = useState(false);

  // Feature 22 State: Code verify
  const [memberInputCode, setMemberInputCode] = useState('839201');
  const [memberVerifyStatus, setMemberVerifyStatus] = useState<string | null>(null);

  // Feature 23 State: Anti-spoofing check
  const [spoofTestName, setSpoofTestName] = useState(currentFamily.headName);
  const [spoofDistanceKm, setSpoofDistanceKm] = useState(12);
  const [spoofResult, setSpoofResult] = useState<string | null>(null);

  // Feature 24 State: Geo Check
  const [currentCoord, setCurrentCoord] = useState('33.3152° N, 44.3661° E (巴格达省卡拉达区网格04)');
  const [geoVerified, setGeoVerified] = useState(true);

  // Feature 25 State: Geo Anomaly Alert
  const [anomalyFlagged, setAnomalyFlagged] = useState(false);

  // Feature 26 State: Archive Logs
  const [archiveList, setArchiveList] = useState([
    {
      id: 'LOG-AUTH-9011',
      member: '艾哈迈德·哈桑·萨利赫',
      type: '活体人脸识别',
      confidence: '98.9%',
      timestamp: '2026-10-09 10:14:02',
      hash: 'sha256:d8a9e7011...bc41',
      auditedBy: '系统自动上链'
    },
    {
      id: 'LOG-AUTH-9012',
      member: '法蒂玛·拉希德·阿里',
      type: 'NFC统一卡芯片比对',
      confidence: '100.0%',
      timestamp: '2026-10-08 14:22:19',
      hash: 'sha256:4f039a820...912e',
      auditedBy: '审计员 (穆斯塔法·纳比勒)'
    }
  ]);

  const handleStartFaceScan = () => {
    setFaceScanning(true);
    setFaceResult(null);
    setTimeout(() => {
      setFaceScanning(false);
      setFaceResult({
        match: true,
        confidence: 98.7,
        name: currentFamily.headName
      });
      // Mark verified
      const updated = {
        ...currentFamily,
        members: currentFamily.members.map((m, idx) => idx === 0 ? { ...m, faceVerified: true } : m)
      };
      onUpdateFamily(updated);
    }, 1800);
  };

  const handleStartNfcRead = () => {
    setNfcReading(true);
    setNfcCardData(null);
    setTimeout(() => {
      setNfcReading(false);
      setNfcCardData({
        cardSerial: 'NFC-IQ-88190284',
        nationalId: currentFamily.members[0].nationalId,
        fullName: currentFamily.members[0].name,
        chipVersion: 'ICAO-9303 Biometric SmartCard v3.2'
      });
    }, 1500);
  };

  const handleGenerateRemoteLink = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const link = `https://m.rationcard.gov.iq/verify-remote?session=SESS-${Date.now()}&code=${code}&card=${currentFamily.rationCardNo}&m=${selectedRemoteMemberId}`;
    setGeneratedLink(link);
    setGeneratedOtp(code);
    setMemberInputCode(code);
    setRemoteRejectionNotice(null);
  };

  const handleRemoteMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRemoteRejectionNotice(null);
    const targetMember = currentFamily.members.find(m => m.id === selectedRemoteMemberId) || currentFamily.members[0];

    // Rule 1: Name Mismatch
    const trimmedInput = remotePersonName.trim().replace(/\s+/g, '');
    const expectedName = targetMember.name.trim().replace(/\s+/g, '');
    if (trimmedInput !== expectedName) {
      setRemoteRejectionNotice({
        status: 'rejected_name',
        message: t.rejectNameMismatchMsg
      });
      return;
    }

    // Rule 2: Same Location as Household
    if (remotePersonLocation === 'same') {
      setRemoteRejectionNotice({
        status: 'rejected_location',
        message: t.rejectSameLocationMsg
      });
      return;
    }

    // Success
    const locationLabels: Record<string, string> = {
      basra: '巴士拉港口区 (异地 540km)',
      erbil: '埃尔比勒科技城 (异地 360km)',
      mosul: '摩苏尔大学城 (异地 405km)'
    };
    const locText = locationLabels[remotePersonLocation] || '异地合规位置';

    setRemoteRejectionNotice({
      status: 'success',
      message: t.remoteVerifySuccessMsg
    });

    const updated = {
      ...currentFamily,
      members: currentFamily.members.map(m =>
        m.id === targetMember.id
          ? {
              ...m,
              faceVerified: true,
              remoteVerified: true,
              remoteVerifiedLocation: locText,
              remoteVerifiedAt: new Date().toISOString()
            }
          : m
      )
    };
    onUpdateFamily(updated);

    // Add to archive logs
    setArchiveList(prev => [
      {
        id: `LOG-REMOTE-${Date.now().toString().slice(-4)}`,
        member: targetMember.name,
        type: `异地远程核验 (${locText})`,
        confidence: '99.5%',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        hash: `sha256:e8f20...${Math.random().toString(36).slice(-4)}`,
        auditedBy: '地理位置风控引擎自动核准'
      },
      ...prev
    ]);
  };

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('face_match')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'face_match' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5" /> 19. 人脸识别比对
          </button>
          <button
            onClick={() => setActiveTab('unified_card_nfc')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'unified_card_nfc' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Nfc className="w-3.5 h-3.5" /> 20. 统一卡NFC采集
          </button>
          <button
            onClick={() => setActiveTab('share_link')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'share_link' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> 21. 验证链接分享
          </button>
          <button
            onClick={() => setActiveTab('code_verify')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'code_verify' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> 22. 验证码核验
          </button>
          <button
            onClick={() => setActiveTab('anti_spoofing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'anti_spoofing' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> 23. 防冒用校验
          </button>
          <button
            onClick={() => setActiveTab('geo_check')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'geo_check' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> 24. 地理位置校验
          </button>
          <button
            onClick={() => setActiveTab('geo_anomaly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'geo_anomaly' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> 25. 位置异常提醒
          </button>
          <button
            onClick={() => setActiveTab('archive_logs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'archive_logs' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Archive className="w-3.5 h-3.5" /> 26. 验证记录留档
          </button>
        </div>
      </div>

      {/* Feature 19: Face Match */}
      {activeTab === 'face_match' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 19：人脸识别活体比对 (现场活体拍摄面部照片，与统一卡生物特征核验)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              通过高清摄像头或移动端前置相机拍摄活体面容，与国家统一智能身份证芯片底册进行高精度生物特征比对。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Live Camera Viewport Simulation */}
            <div className="relative aspect-4/3 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center text-white">
              <div className="absolute inset-8 border border-indigo-500/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-36 h-48 border-2 border-dashed border-indigo-400/80 rounded-full flex items-center justify-center">
                  <span className="text-[11px] text-indigo-300 bg-slate-900/80 px-2 py-0.5 rounded">请将面部对准框内</span>
                </div>
              </div>

              {faceScanning ? (
                <div className="flex flex-col items-center gap-2 z-10">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <span className="text-xs text-indigo-200">活体眨眼检测中 · 提取特征点...</span>
                </div>
              ) : faceResult ? (
                <div className="flex flex-col items-center gap-2 z-10">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-semibold">活体认证成功 ({faceResult.confidence}%)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 z-10 text-slate-400">
                  <Camera className="w-8 h-8 text-slate-500" />
                  <span className="text-xs">摄像头传感器已就绪</span>
                </div>
              )}
            </div>

            {/* Results & Action */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="text-slate-500">待核验家庭成员：</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentFamily.headName}
                </div>
                <div className="text-slate-500 font-mono">
                  身份证号: {currentFamily.members[0].nationalId}
                </div>
              </div>

              <button
                onClick={handleStartFaceScan}
                disabled={faceScanning}
                className="w-full py-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                {faceScanning ? '比对中...' : '启动活体人脸识别比对'}
              </button>

              {faceResult && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="font-semibold">✓ 生物特征核验通过 (置信度: {faceResult.confidence}%)</div>
                  <div>系统已自动将面部特征模板与底册统一卡关联，赋予「已人脸核验」凭证。</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feature 20: NFC Reading */}
      {activeTab === 'unified_card_nfc' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 20：统一卡信息采集 (支持 NFC 芯片感应读取)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              通过设备 NFC 感应区读取统一身份证 (National Unified ID Card) 内置加密芯片，免人工录入并杜绝伪造假证。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="p-8 border-2 border-dashed border-indigo-300 dark:border-indigo-800 rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-indigo-50/20 dark:bg-indigo-950/10">
              <Nfc className={`w-12 h-12 text-indigo-500 ${nfcReading ? 'animate-pulse' : ''}`} />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {nfcReading ? '正在贴卡交互中...' : '请将实体统一卡贴紧设备背部感应区'}
                </span>
                <p className="text-xs text-slate-500 mt-1">支持 ISO 14443 Type A/B 加密芯片标准</p>
              </div>
              <button
                onClick={handleStartNfcRead}
                disabled={nfcReading}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                {nfcReading ? '读取中...' : '模拟接触并读取 NFC 芯片数据'}
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">芯片解密数据载荷：</span>
              {nfcCardData ? (
                <div className="space-y-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1 font-mono">
                    <div className="text-slate-500">芯片序列号: <span className="text-slate-900 dark:text-white font-bold">{nfcCardData.cardSerial}</span></div>
                    <div className="text-slate-500">持卡人全名: <span className="text-slate-900 dark:text-white font-bold">{nfcCardData.fullName}</span></div>
                    <div className="text-slate-500">统一身份证号: <span className="text-slate-900 dark:text-white font-bold">{nfcCardData.nationalId}</span></div>
                    <div className="text-slate-500">安全规范: <span className="text-indigo-600 dark:text-indigo-400">{nfcCardData.chipVersion}</span></div>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> 芯片证书签名有效，无篡改痕迹
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">点击左侧按钮启动模拟 NFC 贴卡感应。</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feature 21: Share Link */}
      {activeTab === 'share_link' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                功能点 21：远程验证链接分享 (户主创建验证链接分发给不在现场的家庭成员)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                家庭成员异地上学或外地工作不在现场时，户主可生成带有防重放令牌的时效专属链接发送给成员完成远程核验。
              </p>
            </div>
            <button
              onClick={() => setIsRemoteModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors w-fit cursor-pointer"
            >
              打开独立全屏远程核验模拟
            </button>
          </div>

          <div className="max-w-xl space-y-4">
            {/* Select Absent Member */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                选择不在现场的家庭成员
              </label>
              <select
                value={selectedRemoteMemberId}
                onChange={e => {
                  setSelectedRemoteMemberId(e.target.value);
                  setGeneratedLink(null);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              >
                {currentFamily.members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relation}) · {m.faceVerified ? '已通过生物核验' : '待异地远程核验'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateRemoteLink}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              创建远程验证链接及动态验证码
            </button>

            {generatedLink && (
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-300">生成的安全加密链接 (有效期 24 小时)：</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">验证码: {generatedOtp}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-600 dark:text-slate-300 break-all flex items-center justify-between gap-2">
                  <span>{generatedLink}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(generatedLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  业务规则：户主将链接与6位验证码发送给不在现场的家庭成员；后者下载应用、点击链接并输入验证码即可远程核验。若姓名不符或处于同一位置将被系统拒绝。
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature 22: Code Verify & Location Checking */}
      {activeTab === 'code_verify' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 22：受邀成员远程应用验证 (核查姓名匹配与异地地理位置)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              家庭成员下载应用或点击链接后，录入6位验证码及真实姓名。系统将核查该人员的实际地理位置：若姓名不符或该成员与家庭处于同一位置，验证将被系统拒绝。
            </p>
          </div>

          <form onSubmit={handleRemoteMemberSubmit} className="max-w-xl space-y-4 text-xs">
            {/* Quick Fill for Fast Testing */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 text-[11px]">
              <span className="text-slate-500 py-0.5">快捷规则测试：</span>
              <button
                type="button"
                onClick={() => {
                  const target = currentFamily.members.find(m => m.id === selectedRemoteMemberId) || currentFamily.members[0];
                  setRemotePersonName(target.name);
                  setRemotePersonLocation('erbil');
                  setRemoteRejectionNotice(null);
                }}
                className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded cursor-pointer"
              >
                ① 正常异地且姓名相符 (通过)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRemotePersonName('哈立德·拉希德·萨利赫');
                  setRemotePersonLocation('erbil');
                  setRemoteRejectionNotice(null);
                }}
                className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded cursor-pointer"
              >
                ② 测试姓名不符 (拒绝)
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = currentFamily.members.find(m => m.id === selectedRemoteMemberId) || currentFamily.members[0];
                  setRemotePersonName(target.name);
                  setRemotePersonLocation('same');
                  setRemoteRejectionNotice(null);
                }}
                className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded cursor-pointer"
              >
                ③ 测试与家庭处于同一位置 (拒绝)
              </button>
            </div>

            {/* Verification Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                输入6位远程验证码 (OTP)
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={memberInputCode}
                onChange={e => setMemberInputCode(e.target.value)}
                placeholder="例如: 839201"
                className="w-full px-4 py-2 text-sm font-mono tracking-widest text-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            {/* Target Person Name Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  受邀家庭成员真实姓名 (FullName)
                </label>
                <span className="text-[11px] text-slate-400">
                  当前核验目标：{currentFamily.members.find(m => m.id === selectedRemoteMemberId)?.name}
                </span>
              </div>
              <input
                type="text"
                required
                value={remotePersonName}
                onChange={e => setRemotePersonName(e.target.value)}
                placeholder="请输入公民完整姓名"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            {/* Member GPS Location Checking */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>应用核查该人员的实际地理位置 (GPS/基站)</span>
                </label>
                <span className="text-[11px] text-slate-400">家庭常住地：巴格达市</span>
              </div>
              <select
                value={remotePersonLocation}
                onChange={e => setRemotePersonLocation(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="same">巴格达家庭所在住址 (与家庭处于同一位置 / 距离 0.1km)</option>
                <option value="erbil">埃尔比勒科技城 (异地 / 距离家庭 360km)</option>
                <option value="basra">巴士拉省工业区 (异地 / 距离家庭 540km)</option>
                <option value="mosul">摩苏尔大学城 (异地 / 距离家庭 405km)</option>
              </select>
            </div>

            {/* Verification Result Feedback */}
            {remoteRejectionNotice && (
              <div
                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  remoteRejectionNotice.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {remoteRejectionNotice.message}
              </div>
            )}

            {/* Submit Button: Strictly NO ICON on confirmation class button */}
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              确认提交远程核验
            </button>
          </form>
        </div>
      )}

      {/* Feature 23: Anti-spoofing */}
      {activeTab === 'anti_spoofing' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 23：防冒用防仿冒强校验 (姓名一致性与地理位置强拦截)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              业务规则：校验操作人姓名与底册一致性，姓名不符或同户多人同时在冲突异地拒绝验证，直接阻断冒领。
            </p>
          </div>

          <div className="max-w-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">提交申报姓名</label>
                <input
                  type="text"
                  value={spoofTestName}
                  onChange={e => setSpoofTestName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">IP与基站定位距离户籍差 (km)</label>
                <input
                  type="number"
                  value={spoofDistanceKm}
                  onChange={e => setSpoofDistanceKm(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (spoofTestName !== currentFamily.headName) {
                  setSpoofResult('❌ 强行拦截：申报姓名与国家统一卡档案数据库完全不符，判定为冒用嫌疑！已触发安全熔断。');
                } else if (spoofDistanceKm > 300) {
                  setSpoofResult('⚠️ 风险阻断：地理位置距离户籍登记区超过 300 公里且未报备异地出行，已挂起人工复核。');
                } else {
                  setSpoofResult('✓ 防冒用检测通过：姓名强一致性核验 100%，地理基准在正常服务半径内。');
                }
              }}
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
            >
              运行防冒用与一致性沙盒测试
            </button>

            {spoofResult && (
              <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                spoofResult.includes('❌') ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300' :
                spoofResult.includes('⚠️') ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300' :
                'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}>
                {spoofResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature 24 & 25: Geo Check & Anomaly */}
      {(activeTab === 'geo_check' || activeTab === 'geo_anomaly') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 24 / 25：业务办理地理位置核验与异常告警
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              核验申请人申报时的真实物理地理位置；异常跨区、虚假模拟定位时实时输出风险提示并转人工复核。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">当前实时定位核验结果：</span>
              <div className="text-xs font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                <div>定位坐标: {currentCoord}</div>
                <div>所属辖区: 巴格达省卡拉达配给分销辖区</div>
                <div>基站网格比对: <span className="text-emerald-600 font-semibold">网格匹配吻合</span></div>
                <div>GPS模拟器检测: <span className="text-emerald-600 font-semibold">未检测到作弊钩子</span></div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">位置异常风控测试：</span>
              <p className="text-xs text-slate-500">模拟异地IP伪造或跨国申请触发异常工作流</p>
              <button
                onClick={() => setAnomalyFlagged(!anomalyFlagged)}
                className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{anomalyFlagged ? '重置为正常位置' : '注入位置异常 (跨省越界风险)'}</span>
              </button>

              {anomalyFlagged && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="font-semibold">⚠️ 触发地理位置异常告警！</div>
                  <div>经纬度与家庭卡登记省份相距超过 500 公里，业务已自动挂起，已推送待办任务转配给分部员工人工复核。</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feature 26: Verify Archive */}
      {activeTab === 'archive_logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 26：验证记录对账留档与审计存证
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              验证照片、时间戳与人脸置信度自动上传对账存储留档，与业务申请绑定，供分部员工与审计人员备查。
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">存证编号</th>
                  <th className="px-4 py-3 font-medium">被核验人</th>
                  <th className="px-4 py-3 font-medium">验证方式</th>
                  <th className="px-4 py-3 font-medium">置信度</th>
                  <th className="px-4 py-3 font-medium">存证哈希 (SHA-256)</th>
                  <th className="px-4 py-3 font-medium">时间</th>
                  <th className="px-4 py-3 font-medium">审计主体</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                {archiveList.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400">{item.id}</td>
                    <td className="px-4 py-3 font-sans text-slate-900 dark:text-white">{item.member}</td>
                    <td className="px-4 py-3 font-sans">{item.type}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">{item.confidence}</td>
                    <td className="px-4 py-3 text-slate-400">{item.hash}</td>
                    <td className="px-4 py-3">{item.timestamp}</td>
                    <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-400">{item.auditedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Standalone Fullscreen Remote Verification Modal */}
      <RemoteVerificationModal
        isOpen={isRemoteModalOpen}
        onClose={() => setIsRemoteModalOpen(false)}
        family={currentFamily}
        initialMemberId={selectedRemoteMemberId}
        onVerifySuccess={(memberId, loc) => {
          const target = currentFamily.members.find(m => m.id === memberId);
          if (target) {
            const updated = {
              ...currentFamily,
              members: currentFamily.members.map(m =>
                m.id === memberId
                  ? {
                      ...m,
                      faceVerified: true,
                      remoteVerified: true,
                      remoteVerifiedLocation: loc,
                      remoteVerifiedAt: new Date().toISOString()
                    }
                  : m
              )
            };
            onUpdateFamily(updated);

            // Add to archive logs
            setArchiveList(prev => [
              {
                id: `LOG-REMOTE-${Date.now().toString().slice(-4)}`,
                member: target.name,
                type: `异地远程核验 (${loc})`,
                confidence: '99.5%',
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                hash: `sha256:e8f20...${Math.random().toString(36).slice(-4)}`,
                auditedBy: '地理位置风控引擎自动核准'
              },
              ...prev
            ]);
          }
        }}
        currentLang={lang}
      />
    </div>
  );
};
