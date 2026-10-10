import React, { useState } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Scan,
  AlertTriangle
} from 'lucide-react';
import { Language, useI18n } from '../i18n/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess: () => void;
  hardwareCode: string;
  userName: string;
  userCardNo?: string;
  currentLang: Language;
}

export const BiometricLoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirmSuccess,
  hardwareCode,
  userName,
  userCardNo = 'RC-10029381',
  currentLang
}) => {
  const { t } = useI18n();

  // Step States
  const [facePhotoTaken, setFacePhotoTaken] = useState(false);
  const [isCapturingFace, setIsCapturingFace] = useState(false);
  const [cardFrontUploaded, setCardFrontUploaded] = useState(false);
  const [cardBackUploaded, setCardBackUploaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationPassed, setVerificationPassed] = useState(false);

  if (!isOpen) return null;

  // Simulate Face Photo Capture
  const handleCaptureFace = () => {
    setIsCapturingFace(true);
    setTimeout(() => {
      setIsCapturingFace(false);
      setFacePhotoTaken(true);
      checkAutoMatch(true, cardFrontUploaded, cardBackUploaded);
    }, 1200);
  };

  // Simulate Front Upload
  const handleUploadFront = () => {
    setCardFrontUploaded(true);
    checkAutoMatch(facePhotoTaken, true, cardBackUploaded);
  };

  // Simulate Back Upload
  const handleUploadBack = () => {
    setCardBackUploaded(true);
    checkAutoMatch(facePhotoTaken, cardFrontUploaded, true);
  };

  // Trigger Biometric Cross-Match when all 3 materials are prepared
  const checkAutoMatch = (face: boolean, front: boolean, back: boolean) => {
    if (face && front && back) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setVerificationPassed(true);
      }, 1500);
    }
  };

  // One-click quick load all materials for swift testing
  const handleQuickLoadAll = () => {
    setFacePhotoTaken(true);
    setCardFrontUploaded(true);
    setCardBackUploaded(true);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationPassed(true);
    }, 1000);
  };

  const allReady = facePhotoTaken && cardFrontUploaded && cardBackUploaded && verificationPassed;

  return (
    <div
      dir="ltr"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-7 text-white shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Iraqi National Emblem & Security Info */}
        <div className="border-b border-slate-800 pb-4 mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {t.deviceCheckTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.deviceCheckSubtitle}
              </p>
            </div>
          </div>

          {/* Hardware Device Code Badge Banner */}
          <div className="mt-3.5 p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400">{t.hardwareCodeLabel}:</span>
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {hardwareCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">
                {t.hardwareStatusNew}
              </span>
              <button
                type="button"
                onClick={handleQuickLoadAll}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                {t.quickFillDemo}
              </button>
            </div>
          </div>
        </div>

        {/* Three Step Verification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Live Face Capture */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  {t.step1LiveFace}
                </span>
                {facePhotoTaken && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已就绪
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.step1LiveFaceDesc}
              </p>
            </div>

            {/* Live Camera Viewfinder Simulation */}
            <div className="relative aspect-4/3 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 flex flex-col items-center justify-center">
              {facePhotoTaken ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-800">
                  {/* High Quality Simulated Face Portrait */}
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                    alt="Live Face"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                      活体置信度 99.8% (已通过)
                    </span>
                  </div>
                </div>
              ) : isCapturingFace ? (
                <div className="flex flex-col items-center gap-2 text-indigo-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-[11px]">正在进行活体面部特征捕捉...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-3 text-center">
                  <div className="w-16 h-20 border-2 border-dashed border-emerald-500/50 rounded-full flex items-center justify-center">
                    <Scan className="w-6 h-6 text-emerald-400/80 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-slate-400">请保持面部正对镜头</span>
                </div>
              )}
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={handleCaptureFace}
              disabled={isCapturingFace}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              {facePhotoTaken ? t.retakeFacePhoto : t.takeFacePhoto}
            </button>
          </div>

          {/* Step 2: Unified National Card Front */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  {t.step2IdFront}
                </span>
                {cardFrontUploaded && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已就绪
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.step2IdFrontDesc}
              </p>
            </div>

            {/* National Card Front Preview */}
            <div className="aspect-4/3 bg-linear-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-700 p-2.5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="text-[9px] text-emerald-400 font-bold uppercase">جمهورية العراق · 统一卡</span>
                <span className="text-[9px] font-mono text-slate-400">NID-FRONT</span>
              </div>

              {cardFrontUploaded ? (
                <div className="flex gap-2 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="ID Card Photo"
                    className="w-10 h-12 rounded object-cover border border-slate-600 shrink-0"
                  />
                  <div className="text-[9px] space-y-0.5 leading-tight font-mono">
                    <div className="text-white font-bold">{userName}</div>
                    <div className="text-slate-400">NID: 198709124819</div>
                    <div className="text-emerald-400">发证机关: 内政部国籍署</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <span className="text-[10px]">待上传或扫描实体卡正面</span>
                </div>
              )}

              <div className="text-[8px] text-slate-500 font-mono flex justify-between">
                <span>REPUBLIC OF IRAQ</span>
                <span>CHIP-v3.2</span>
              </div>
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={handleUploadFront}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              {cardFrontUploaded ? '重新上传正面' : t.uploadCardFront}
            </button>
          </div>

          {/* Step 3: Unified National Card Back */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  {t.step3IdBack}
                </span>
                {cardBackUploaded && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已就绪
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.step3IdBackDesc}
              </p>
            </div>

            {/* National Card Back Preview */}
            <div className="aspect-4/3 bg-linear-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-700 p-2.5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="text-[9px] text-slate-400 font-mono">BACK · ICAO-9303</span>
                <span className="text-[9px] text-amber-400 font-mono">CHIP SERIAL</span>
              </div>

              {cardBackUploaded ? (
                <div className="space-y-1 my-auto">
                  <div className="w-7 h-5 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <div className="w-4 h-3 border border-amber-400/60 rounded-xs" />
                  </div>
                  <div className="font-mono text-[8px] text-slate-400 bg-slate-950/80 p-1 rounded leading-tight">
                    <div>I&lt;IRQ198709124819&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
                    <div>8709124M3110298IRQ&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <span className="text-[10px]">待上传或扫描实体卡背面</span>
                </div>
              )}

              <div className="text-[8px] text-slate-500 font-mono flex justify-between">
                <span>BARCODE VERIFIED</span>
                <span>FAMILY-LINKED</span>
              </div>
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={handleUploadBack}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              {cardBackUploaded ? '重新上传反面' : t.uploadCardBack}
            </button>
          </div>
        </div>

        {/* Cross Verification Status Bar */}
        <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
          {isVerifying ? (
            <div className="flex items-center gap-3 text-xs text-indigo-400">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{t.biometricMatchingNotice}</span>
            </div>
          ) : verificationPassed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t.biometricPassedNotice}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <div>
                  特征向量匹配度: <span className="text-white font-mono font-bold">99.4%</span>
                </div>
                <div>
                  芯片防伪安全校验: <span className="text-white font-mono font-bold">通过</span>
                </div>
                <div>
                  内政部数据底账对碰: <span className="text-white font-mono font-bold">吻合</span>
                </div>
                <div>
                  硬件编码授信: <span className="text-emerald-400 font-mono font-bold">已绑定</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>请依次完成现场拍摄照片及统一卡正反两面采集，系统将自动执行生物识别比对</span>
              </div>
              <button
                type="button"
                onClick={handleQuickLoadAll}
                className="text-emerald-400 hover:text-emerald-300 font-medium shrink-0 cursor-pointer"
              >
                一键完成全要素采集
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Button: Strictly NO ICON (per user requirement) */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            {t.close}
          </button>
          <button
            type="button"
            onClick={onConfirmSuccess}
            disabled={!allReady}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-950 cursor-pointer"
          >
            {t.confirmBiometricAndEnter}
          </button>
        </div>
      </div>
    </div>
  );
};
