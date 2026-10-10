import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Eye,
  Trash2,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  FileImage,
  X,
  ExternalLink,
  QrCode,
  FolderOpen
} from 'lucide-react';
import { useI18n } from '../../i18n/translations';

export interface UploadedFileInfo {
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'jpg' | 'png';
  documentType: string;
  documentCategory: string;
  issuer: string;
  referenceNo: string;
  issueDate: string;
  sha256Hash: string;
  ocrConfidence: number;
  ocrExtractedText: string;
  officialSealVerified: boolean;
}

export interface MockDocumentUploaderProps {
  documentKey: string;
  title: string;
  subtitle?: string;
  categoryBadge: string;
  categoryColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'teal';
  issuer: string;
  defaultFileName: string;
  defaultRefNo: string;
  ocrSummary: string;
  sampleApplicantName?: string;
  isCompact?: boolean;
  isRequired?: boolean;
  initialUploaded?: boolean;
  onStatusChange?: (isUploaded: boolean, file: UploadedFileInfo | null) => void;
}

export const MockDocumentUploader: React.FC<MockDocumentUploaderProps> = ({
  documentKey,
  title,
  subtitle,
  categoryBadge,
  categoryColor = 'blue',
  issuer,
  defaultFileName,
  defaultRefNo,
  ocrSummary,
  sampleApplicantName = '艾哈迈德·侯赛因·拉希德 (Ahmed H. Rashid)',
  isCompact = false,
  isRequired = false,
  initialUploaded = true,
  onStatusChange
}) => {
  const { lang, t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [isRemovedByUser, setIsRemovedByUser] = useState(!initialUploaded);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(() => {
    if (!initialUploaded) return null;
    return {
      fileName: defaultFileName,
      fileSize: '2.6 MB',
      fileType: defaultFileName.endsWith('.jpg') || defaultFileName.endsWith('.png') ? 'jpg' : 'pdf',
      documentType: documentKey,
      documentCategory: categoryBadge,
      issuer,
      referenceNo: defaultRefNo,
      issueDate: '2026-03-12',
      sha256Hash: `SHA256:7f8e...${documentKey.slice(0, 4)}...c92a`,
      ocrConfidence: 99.4,
      ocrExtractedText: ocrSummary,
      officialSealVerified: true
    };
  });
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Track previous document key to re-populate when business context actually changes
  const prevDocKeyRef = useRef(documentKey);

  // When business context changes (e.g., selecting different unfreeze reasons), re-initialize with new doc defaults
  useEffect(() => {
    if (prevDocKeyRef.current !== documentKey) {
      prevDocKeyRef.current = documentKey;
      setIsRemovedByUser(false);
      setFeedbackNotice(null);
      const newFile: UploadedFileInfo = {
        fileName: defaultFileName,
        fileSize: defaultFileName.endsWith('.pdf') ? '2.4 MB' : '1.8 MB',
        fileType: defaultFileName.endsWith('.jpg') || defaultFileName.endsWith('.png') ? 'jpg' : 'pdf',
        documentType: documentKey,
        documentCategory: categoryBadge,
        issuer,
        referenceNo: defaultRefNo,
        issueDate: '2026-03-12',
        sha256Hash: `SHA256:${Math.random().toString(36).substring(2, 8).toUpperCase()}...${documentKey.slice(0, 3)}`,
        ocrConfidence: 99.2 + Math.floor(Math.random() * 6) / 10,
        ocrExtractedText: ocrSummary,
        officialSealVerified: true
      };
      setUploadedFile(newFile);
      if (onStatusChange) {
        onStatusChange(true, newFile);
      }
    }
  }, [documentKey, defaultFileName, defaultRefNo, categoryBadge, issuer, ocrSummary, onStatusChange]);

  // Color mappings
  const colorStyles = {
    blue: {
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      border: 'border-blue-500/40',
      activeBg: 'bg-blue-500/5',
      accent: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-500 text-white'
    },
    emerald: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      border: 'border-emerald-500/40',
      activeBg: 'bg-emerald-500/5',
      accent: 'text-emerald-500',
      button: 'bg-emerald-600 hover:bg-emerald-500 text-white'
    },
    amber: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      border: 'border-amber-500/40',
      activeBg: 'bg-amber-500/5',
      accent: 'text-amber-500',
      button: 'bg-amber-600 hover:bg-amber-500 text-white'
    },
    purple: {
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      border: 'border-purple-500/40',
      activeBg: 'bg-purple-500/5',
      accent: 'text-purple-500',
      button: 'bg-purple-600 hover:bg-purple-500 text-white'
    },
    rose: {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      border: 'border-rose-500/40',
      activeBg: 'bg-rose-500/5',
      accent: 'text-rose-500',
      button: 'bg-rose-600 hover:bg-rose-500 text-white'
    },
    indigo: {
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      border: 'border-indigo-500/40',
      activeBg: 'bg-indigo-500/5',
      accent: 'text-indigo-500',
      button: 'bg-indigo-600 hover:bg-indigo-500 text-white'
    },
    teal: {
      badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      border: 'border-teal-500/40',
      activeBg: 'bg-teal-500/5',
      accent: 'text-teal-500',
      button: 'bg-teal-600 hover:bg-teal-500 text-white'
    }
  }[categoryColor];

  // Real file selection handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(15);
    setUploadStage(`正在读取本地文件: ${file.name}...`);

    const fileType = file.name.toLowerCase().endsWith('.png')
      ? 'png'
      : file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')
      ? 'jpg'
      : 'pdf';

    const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    let progress = 20;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 95) {
        clearInterval(interval);
        setUploadStage('OCR文本提取及官方印章特征核验完成 ✓');
        setTimeout(() => {
          const completedFile: UploadedFileInfo = {
            fileName: file.name,
            fileSize: fileSizeStr,
            fileType,
            documentType: documentKey,
            documentCategory: categoryBadge,
            issuer,
            referenceNo: defaultRefNo || `DOC-${Date.now().toString().slice(-6)}`,
            issueDate: new Date().toISOString().split('T')[0],
            sha256Hash: `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            ocrConfidence: 99.5,
            ocrExtractedText: `本地上传已完成解析：${file.name} · 印章与条码校验一致`,
            officialSealVerified: true
          };
          setUploadedFile(completedFile);
          setIsRemovedByUser(false);
          setIsUploading(false);
          setFeedbackNotice(`文件【${file.name}】已成功上传并通过数字验签！`);
          setTimeout(() => setFeedbackNotice(null), 3000);
          if (onStatusChange) {
            onStatusChange(true, completedFile);
          }
        }, 300);
      } else {
        setUploadProgress(progress);
        if (progress === 45) {
          setUploadStage('正在进行电子水印与文号防伪比对...');
        } else if (progress === 70) {
          setUploadStage('执行深度OCR识别及签发机构公章验签...');
        }
      }
    }, 120);

    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  // Simulated upload process with progress steps
  const triggerSimulatedUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStage(
      lang === 'ar'
        ? 'إنشاء قناة آمنة وتشفير الوثيقة...'
        : lang === 'ku'
        ? 'دروستکردنی هێڵی پارێزراو بۆ ناردنی بەڵگەنامە...'
        : lang === 'en'
        ? 'Establishing encrypted upload channel...'
        : '正在建立国家加密通信隧道...'
    );

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setUploadStage(
            lang === 'ar'
              ? 'اكتمال المطابقة والتحقق من الختم الرسمي ✓'
              : lang === 'ku'
              ? 'پشکنینی مۆری فەرمی و کۆدی بەڵگەنامە پەسەندکرا ✓'
              : lang === 'en'
              ? 'OCR & Official Seal Verification Passed ✓'
              : 'OCR智能特征提取完成 · 官方印鉴与存根比对通过 ✓'
          );
          setTimeout(() => {
            const completedFile: UploadedFileInfo = {
              fileName: defaultFileName,
              fileSize: '3.1 MB',
              fileType: defaultFileName.endsWith('.jpg') ? 'jpg' : 'pdf',
              documentType: documentKey,
              documentCategory: categoryBadge,
              issuer,
              referenceNo: defaultRefNo,
              issueDate: '2026-03-12',
              sha256Hash: `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              ocrConfidence: 99.6,
              ocrExtractedText: ocrSummary,
              officialSealVerified: true
            };
            setUploadedFile(completedFile);
            setIsRemovedByUser(false);
            setIsUploading(false);
            setFeedbackNotice(`公文样本【${defaultFileName}】已加载并通过核验！`);
            setTimeout(() => setFeedbackNotice(null), 3000);
            if (onStatusChange) {
              onStatusChange(true, completedFile);
            }
          }, 400);
          return 100;
        }

        if (prev === 30) {
          setUploadStage(
            lang === 'ar'
              ? 'رفع ملف المسح الضوئي عالي الدقة (3.1 ميغابايت)...'
              : lang === 'ku'
              ? 'بارکردنی پەڕگەی سکانکراوی روون (٣.١ مێگابایت)...'
              : lang === 'en'
              ? 'Uploading high-resolution scan (3.1 MB)...'
              : '正在上传高分辨率官方公文扫描件 (3.1 MB)...'
          );
        } else if (prev === 65) {
          setUploadStage(
            lang === 'ar'
              ? 'معالجة التعرف الضوئي (OCR) ومطابقة الرمز الشريطي والختم الحكومي...'
              : lang === 'ku'
              ? 'خوێندنەوەی OCR و بارکۆد و بەراوردکاریی مۆری فەرمی...'
              : lang === 'en'
              ? 'Running OCR, barcode scanning and official seal verification...'
              : '正在执行OCR高精识别、条码解码及防伪水印比对...'
          );
        }
        return prev + 15;
      });
    }, 120);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setIsRemovedByUser(true);
    setFeedbackNotice('附件已成功移除，您可以点击重新上传或选择新文件。');
    setTimeout(() => setFeedbackNotice(null), 3500);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onStatusChange) {
      onStatusChange(false, null);
    }
  };

  const handleOpenLocalFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-2">
      {/* Hidden file input for real device file uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Label, requirement badge and category badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <span>{title}</span>
            {isRequired ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
                必需材料 ★
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-500/10 text-slate-400 font-normal">
                可选材料
              </span>
            )}
          </label>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colorStyles.badge}`}>
            {categoryBadge}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {issuer}
        </span>
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}

      {/* Feedback banner */}
      {feedbackNotice && (
        <div className="px-3 py-1.5 rounded-lg text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Uploading progress view */}
      {isUploading ? (
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2.5 animate-pulse">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>{uploadStage}</span>
            </span>
            <span className="font-mono text-blue-400 font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : uploadedFile ? (
        /* Uploaded State - Rich Differentiated File Card */
        <div
          className={`p-3.5 rounded-xl border ${colorStyles.border} ${colorStyles.activeBg} transition-all bg-white dark:bg-slate-900/70 shadow-xs`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg border shrink-0 mt-0.5 ${colorStyles.badge}`}
              >
                {uploadedFile.fileType === 'pdf' ? (
                  <FileText className="w-5 h-5 text-current" />
                ) : (
                  <FileImage className="w-5 h-5 text-current" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono break-all">
                    {uploadedFile.fileName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>
                      {lang === 'ar'
                        ? 'تم التحقق والاعتماد'
                        : lang === 'ku'
                        ? 'پەسەندکراو'
                        : lang === 'en'
                        ? 'Verified & Authenticated'
                        : '已核验并通过'}
                    </span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 font-mono">
                  <span>{uploadedFile.fileSize}</span>
                  <span>•</span>
                  <span>{uploadedFile.referenceNo}</span>
                  <span>•</span>
                  <span className="text-slate-400">OCR: {uploadedFile.ocrConfidence}%</span>
                </div>

                {/* Key OCR snippet to show the document is explicitly distinguished */}
                <div className="p-1.5 px-2 bg-slate-100 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{uploadedFile.ocrExtractedText}</span>
                </div>
              </div>
            </div>

            {/* Actions: Preview & Reupload & Remove */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                title={lang === 'ar' ? 'معاينة الوثيقة' : lang === 'ku' ? 'پیشاندانی بەڵگەنامە' : lang === 'en' ? 'Preview Document' : '预览官方文件原件'}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleOpenLocalFilePicker}
                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                title="选择本地新文件重新上传"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="删除此附件"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Not Uploaded State with Dual Re-upload Options */
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 sm:p-5 text-center bg-slate-50 dark:bg-slate-900/40 hover:border-blue-500/50 transition-colors">
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="p-3 bg-slate-200/50 dark:bg-slate-800 rounded-full text-slate-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isRequired ? '请上传必需的证明材料文件' : '暂未上传附件材料 (支持本地文件或样本)'}
              </div>
              <div className="text-[11px] text-slate-400">
                支持格式：PDF、JPG、PNG (单文件最大 15MB) · 支持本地选择与公文样本快速加载
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap justify-center">
              <button
                type="button"
                onClick={handleOpenLocalFilePicker}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${colorStyles.button}`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>选择本地文件上传</span>
              </button>
              <button
                type="button"
                onClick={triggerSimulatedUpload}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>载入官方公文样本</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Official Preview Modal */}
      {showPreviewModal && uploadedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 text-slate-900 dark:text-white my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <h4 className="text-sm font-bold">
                    {lang === 'ar'
                      ? 'معاينة الوثيقة الرسمية المعتمدة'
                      : lang === 'ku'
                      ? 'پیشاندانی بەڵگەنامەی فەرمیی پەسەندکراو'
                      : lang === 'en'
                      ? 'Official Verified Document Certificate Preview'
                      : '官方公文证明文件数字化核验预览'}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">{uploadedFile.referenceNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Realistic Iraqi Ministry Certificate Layout Preview */}
            <div className="bg-amber-50/40 dark:bg-slate-950 border border-amber-200/50 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 relative overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 dark:opacity-5 select-none font-bold text-6xl text-slate-500 rotate-12">
                IRAQ MINISTRY
              </div>

              {/* Certificate Header */}
              <div className="text-center pb-3 border-b border-slate-300 dark:border-slate-800 space-y-1">
                <div className="text-xs font-bold tracking-widest text-slate-700 dark:text-slate-300">
                  جمهورية العراق · وزارة التجارة / العدل / الصحة
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  REPUBLIC OF IRAQ · OFFICIAL CIVIL & ADMINISTRATIVE VERIFICATION
                </div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 pt-1">
                  {title}
                </div>
              </div>

              {/* Certificate Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">
                    {lang === 'ar' ? 'الجهة المصدرة:' : lang === 'ku' ? 'فەرمانگەی دەرکەر:' : lang === 'en' ? 'Issuing Authority:' : '出具颁发机关:'}
                  </span>
                  <span className="font-semibold">{uploadedFile.issuer}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">
                    {lang === 'ar' ? 'رقم القيد / الوثيقة:' : lang === 'ku' ? 'ژمارەی بەڵگەنامە:' : lang === 'en' ? 'Reference Stub No.:' : '官方档案备案号:'}
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {uploadedFile.referenceNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">
                    {lang === 'ar' ? 'المستفيد / صاحب الشأن:' : lang === 'ku' ? 'خاوەنی بەڵگەنامە:' : lang === 'en' ? 'Applicant / Subject:' : '当事人姓名:'}
                  </span>
                  <span className="font-semibold">{sampleApplicantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">
                    {lang === 'ar' ? 'تاريخ التوثيق:' : lang === 'ku' ? 'بەرواری دەرچوون:' : lang === 'en' ? 'Certified Date:' : '核准签发日期:'}
                  </span>
                  <span className="font-mono">{uploadedFile.issueDate}</span>
                </div>
              </div>

              {/* Extracted OCR & Seal Status */}
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'ar' ? 'بيانات التحقق الرقمي والـ OCR:' : lang === 'ku' ? 'داتای پشکنینی OCR و مۆر:' : lang === 'en' ? 'OCR Extraction & Validation:' : 'OCR智能识别提取结论与防伪鉴证:'}
                  </span>
                  <span className="text-emerald-500 font-mono text-[11px] font-bold">
                    ✓ 置信度 {uploadedFile.ocrConfidence}%
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {uploadedFile.ocrExtractedText}
                </p>
              </div>

              {/* Simulated Stamp and Barcode */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-300 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-rose-500 text-rose-500 text-[8px] font-bold flex items-center justify-center text-center p-1 leading-tight rotate-12 select-none">
                    وزارة التجارة<br />معتمد رسمي<br />2026
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    DIGITAL SEAL VALIDATED<br />
                    {uploadedFile.sha256Hash}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="font-mono text-[10px] tracking-widest text-slate-500">
                    ||||| | |||| || |||||| | |||||
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">{uploadedFile.referenceNo}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
