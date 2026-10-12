<template>
  <div class="member-transfer-view space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <!-- 顶部标题与返回导航 -->
      <div class="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <el-icon class="text-indigo-600"><User /></el-icon>
            <span>{{ $t('memberTransfer.title') }}</span>
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            {{ $t('memberTransfer.subtitle') }}
          </p>
        </div>
        <el-button size="small" plain @click="$router.push('/citizen')">
          <el-icon class="mr-1"><Back /></el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <!-- 当前接收卡家庭概览 -->
      <div v-if="citizenStore.currentFamily" class="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span class="text-slate-400 block text-[11px]">{{ $t('common.rationCardNo') }} (接收新卡)：</span>
          <span class="font-mono font-bold text-indigo-600">{{ citizenStore.currentFamily.rationCardNo }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">{{ $t('citizen.headName') }}：</span>
          <span class="font-bold text-slate-800">{{ currentHeadName }} ({{ citizenStore.currentFamily.memberCount }} 人)</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">新卡家庭编号：</span>
          <span class="font-mono font-medium text-slate-800">{{ currentFamilyCode }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">{{ $t('citizen.province') }} / {{ $t('citizen.district') }}：</span>
          <span class="font-medium text-slate-800 truncate block">{{ citizenStore.currentFamily.province }} · {{ citizenStore.currentFamily.district }}</span>
        </div>
      </div>

      <!-- 步骤导航条 -->
      <div class="py-2">
        <el-steps :active="currentStep - 1" finish-status="success" align-center>
          <el-step :title="$t('memberTransfer.step1')" />
          <el-step :title="$t('memberTransfer.step2')" />
          <el-step :title="$t('memberTransfer.step3')" />
          <el-step :title="$t('memberTransfer.step4')" />
        </el-steps>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 1: 录入成员国民编号与资格核验 (演示模式与真实验证逻辑区分) -->
      <!-- ======================================================== -->
      <div v-show="currentStep === 1" class="space-y-4 animate-fade-in">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">1</span>
            <span>{{ $t('memberTransfer.step1') }}</span>
          </label>
          <span class="text-xs text-slate-400">核验更新状态与被转移成员活体意愿</span>
        </div>

        <!-- 演示模式 vs 真实核验模式 切换面板 -->
        <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <span class="font-bold text-slate-700 flex items-center gap-1">
              <el-icon class="text-indigo-600"><Operation /></el-icon>
              <span>{{ $t('memberTransfer.modeTitle') }}：</span>
            </span>
            <el-radio-group v-model="verificationMode" size="small" @change="handleModeChange">
              <el-radio-button value="demo">
                <span class="flex items-center gap-1 font-semibold">
                  <el-icon><MagicStick /></el-icon>
                  <span>{{ $t('memberTransfer.demoMode') }}</span>
                </span>
              </el-radio-button>
              <el-radio-button value="real">
                <span class="flex items-center gap-1 font-semibold">
                  <el-icon><Lock /></el-icon>
                  <span>{{ $t('memberTransfer.realMode') }}</span>
                </span>
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="text-[11px]">
            <span v-if="verificationMode === 'demo'" class="text-indigo-600 font-medium">
              💡 {{ $t('memberTransfer.demoModeDesc') }}
            </span>
            <span v-else class="text-amber-700 font-medium">
              🛡️ {{ $t('memberTransfer.realModeDesc') }}
            </span>
          </div>
        </div>

        <!-- 快捷演示推荐编号清单 (一键填充并核验) -->
        <div class="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2 text-xs">
          <div class="font-bold text-indigo-900 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <el-icon><InfoFilled /></el-icon>
              <span>推荐用于演示的标准被转移国民编号（点击即可一键填入并核验）：</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            <el-tag
              size="default"
              class="cursor-pointer hover:scale-105 transition-transform font-mono font-bold"
              type="success"
              effect="plain"
              @click="fillAndQuery('198302194821')"
            >
              198302194821 (妻子·自动批准)
            </el-tag>
            <el-tag
              size="default"
              class="cursor-pointer hover:scale-105 transition-transform font-mono font-bold"
              type="primary"
              effect="plain"
              @click="fillAndQuery('201509124481')"
            >
              201509124481 (子女·自动批准)
            </el-tag>
            <el-tag
              size="default"
              class="cursor-pointer hover:scale-105 transition-transform font-mono font-bold"
              type="warning"
              effect="plain"
              @click="fillAndQuery('201608219902')"
            >
              201608219902 (子女·140区两级审核)
            </el-tag>
            <el-tag
              size="default"
              class="cursor-pointer hover:scale-105 transition-transform font-mono font-bold"
              type="info"
              effect="plain"
              @click="fillAndQuery('201011029871')"
            >
              201011029871 (法定监护·两级审核)
            </el-tag>
            <el-tag
              size="default"
              class="cursor-pointer hover:scale-105 transition-transform font-mono font-bold"
              type="danger"
              effect="plain"
              @click="fillAndQuery('200109128833')"
            >
              200109128833 (未在系统更新·红线拦截)
            </el-tag>
          </div>
        </div>

        <!-- 国民编号查询输入框 -->
        <div class="flex gap-3">
          <div class="flex-1">
            <el-input
              v-model="searchNationalId"
              :placeholder="verificationMode === 'demo' ? '输入被转移成员国民编号 (如 198302194821 或任意编号如 1233213)' : '输入国家数据库收录之有效国民编号 (如 198302194821)'"
              size="large"
              clearable
              maxlength="18"
              @keyup.enter="handleQueryMember"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-button
            type="primary"
            size="large"
            :loading="querying"
            class="px-6 font-bold"
            @click="handleQueryMember"
          >
            {{ $t('memberTransfer.queryBtn') }}
          </el-button>
        </div>

        <!-- 真实验证模式下的查无此人拦截提示卡片 -->
        <div v-if="realModeErrorMsg" class="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1.5 animate-shake">
          <div class="font-bold flex items-center gap-2 text-sm text-amber-800">
            <el-icon :size="18"><CircleCloseFilled /></el-icon>
            <span>国家人口档案库拦截提示</span>
          </div>
          <p class="leading-relaxed">
            {{ realModeErrorMsg }}
          </p>
        </div>

        <!-- 查找到的被转移成员卡片 -->
        <div v-if="selectedMember" class="space-y-4">
          <!-- 演示场景快捷切换器 (在演示模式下极大地提升演示体验) -->
          <div v-if="verificationMode === 'demo'" class="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 text-xs">
            <div class="font-bold text-purple-900 flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <el-icon><Tools /></el-icon>
                <span>{{ $t('memberTransfer.scenarioSwitcherTitle') }}</span>
              </div>
              <el-tag size="small" type="purple" effect="plain" v-if="selectedMember.isDemoGenerated">
                {{ $t('memberTransfer.demoBadge') }}
              </el-tag>
            </div>
            <div class="flex flex-wrap gap-2">
              <el-button size="small" :type="currentScenarioKey === 'wifeAuto' ? 'primary' : 'default'" @click="applyScenarioPreset('wifeAuto')">
                {{ $t('memberTransfer.scenarioWifeAuto') }}
              </el-button>
              <el-button size="small" :type="currentScenarioKey === 'wifeReview' ? 'primary' : 'default'" @click="applyScenarioPreset('wifeReview')">
                {{ $t('memberTransfer.scenarioWifeReview') }}
              </el-button>
              <el-button size="small" :type="currentScenarioKey === 'childAuto' ? 'primary' : 'default'" @click="applyScenarioPreset('childAuto')">
                {{ $t('memberTransfer.scenarioChildAuto') }}
              </el-button>
              <el-button size="small" :type="currentScenarioKey === 'child140' ? 'primary' : 'default'" @click="applyScenarioPreset('child140')">
                {{ $t('memberTransfer.scenarioChild140') }}
              </el-button>
              <el-button size="small" :type="currentScenarioKey === 'guardianship' ? 'primary' : 'default'" @click="applyScenarioPreset('guardianship')">
                {{ $t('memberTransfer.scenarioGuardianship') }}
              </el-button>
              <el-button size="small" :type="currentScenarioKey === 'notUpdated' ? 'danger' : 'default'" plain @click="applyScenarioPreset('notUpdated')">
                {{ $t('memberTransfer.scenarioNotUpdated') }}
              </el-button>
            </div>
          </div>

          <!-- 法定红线拦截警示条 (当未在系统中更新时) -->
          <div
            v-if="!selectedMember.isUpdatedInSystem"
            class="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 space-y-2 animate-shake"
          >
            <div class="font-bold flex items-center gap-2 text-sm text-rose-800">
              <el-icon :size="20"><CircleCloseFilled /></el-icon>
              <span>{{ $t('memberTransfer.notUpdatedAlert') }}</span>
            </div>
            <p class="text-xs text-rose-700 leading-relaxed">
              依据伊拉克贸易部配给总局第 2026/04 号规程，所有成员在发起跨卡转移前，必须已在国家配给卡系统中完成个人登记信息更新（包含人脸微表情特征、常住地网格与民事地位）。该成员尚未在系统中更新，<strong>系统严厉禁止办理转移业务，禁止点击下一步！</strong>
            </p>
          </div>

          <!-- 成员详情档案卡片 -->
          <div
            class="p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs"
            :class="selectedMember.isUpdatedInSystem ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/30 border-rose-200 opacity-80'"
          >
            <div>
              <span class="text-slate-400 block text-[11px]">{{ $t('citizen.name') }}：</span>
              <span class="font-bold text-slate-800 text-sm">{{ selectedMember.name }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">{{ $t('memberTransfer.inputNationalId') }}：</span>
              <span class="font-mono font-bold text-slate-800">{{ selectedMember.nationalId }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">{{ $t('citizen.gender') }} / {{ $t('citizen.birthDate') }}：</span>
              <span class="text-slate-800">{{ selectedMember.gender }} ({{ selectedMember.birthDate }})</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">生父姓名 (Father Name)：</span>
              <span class="font-bold text-slate-800">{{ selectedMember.fatherName }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">原所属家庭编号：</span>
              <span class="font-mono text-slate-800">{{ selectedMember.familyCode }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">原所属电子配给卡号：</span>
              <span class="font-mono text-slate-800">{{ selectedMember.currentCardNo }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">原所属省份与中心：</span>
              <span class="text-slate-800 truncate block">{{ selectedMember.currentProvince }} · {{ selectedMember.currentCenterName }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">系统更新状态：</span>
              <el-tag :type="selectedMember.isUpdatedInSystem ? 'success' : 'danger'" size="small">
                {{ selectedMember.isUpdatedInSystem ? $t('memberTransfer.updatedPass') : '未在系统中更新 (禁止办理)' }}
              </el-tag>
            </div>
          </div>

          <!-- 生物识别核验模块 (仅当未被拦截时展示) -->
          <div
            v-if="selectedMember.isUpdatedInSystem"
            class="p-4 bg-indigo-50/40 border border-indigo-200 rounded-xl space-y-3"
          >
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <div class="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <el-icon class="text-emerald-600"><CircleCheckFilled /></el-icon>
                  <span>{{ $t('memberTransfer.biometricTitle') }}</span>
                </div>
                <div class="text-[11px] text-slate-500">
                  {{ $t('memberTransfer.biometricNotice') }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <el-tag v-if="biometricVerified" type="success" effect="dark" size="small">
                  {{ $t('memberTransfer.biometricVerified') }}
                </el-tag>
                <el-button
                  size="small"
                  :type="biometricVerified ? 'default' : 'primary'"
                  :loading="verifyingBiometric"
                  @click="handleDoBiometric"
                >
                  {{ biometricVerified ? '重新核验' : $t('memberTransfer.verifyBiometricBtn') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 2: 选择转移原因与关系匹配 (智能规则引擎比对) -->
      <!-- ======================================================== -->
      <div v-show="currentStep === 2" class="space-y-5 animate-fade-in">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">2</span>
            <span>{{ $t('memberTransfer.step2') }}</span>
          </label>
          <span class="text-xs text-slate-400">核对法定关系规则及上传证明文件</span>
        </div>

        <!-- 转移情形单选 -->
        <div class="space-y-2">
          <span class="block text-xs font-semibold text-slate-700">{{ $t('memberTransfer.transferTypeLabel') }}：</span>
          <el-radio-group v-model="transferReasonType" class="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            <el-radio-button value="wife" class="w-full text-left">
              {{ $t('memberTransfer.typeWife') }}
            </el-radio-button>
            <el-radio-button value="child" class="w-full text-left">
              {{ $t('memberTransfer.typeChild') }}
            </el-radio-button>
            <el-radio-button value="guardianship" class="w-full text-left">
              {{ $t('memberTransfer.typeGuardianship') }}
            </el-radio-button>
            <el-radio-button value="support" class="w-full text-left">
              {{ $t('memberTransfer.typeSupport') }}
            </el-radio-button>
            <el-radio-button value="other" class="w-full text-left">
              {{ $t('memberTransfer.typeOther') }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 规则引擎实时研判卡片 -->
        <div class="space-y-3">
          <!-- 妻子规则比对展示 -->
          <div v-if="transferReasonType === 'wife'" class="p-4 rounded-xl border text-xs space-y-2" :class="wifeRecognized ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'">
            <div class="font-bold flex items-center gap-1.5 text-sm">
              <el-icon><Connection /></el-icon>
              <span>{{ $t('memberTransfer.wifeMatchTitle') }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>家庭编号比对：<span class="font-mono font-bold">{{ selectedMember?.familyCode }} vs {{ currentFamilyCode }}</span> ({{ selectedMember?.familyCode === currentFamilyCode ? '一致 ✓' : '不一致 ✗' }})</div>
              <div>双方父亲比对：<span class="font-bold">{{ selectedMember?.fatherName }} vs {{ currentHeadFatherName }}</span> ({{ selectedMember?.fatherName !== currentHeadFatherName ? '不同（非姐妹） ✓' : '相同 ✗' }})</div>
            </div>
            <p class="font-medium pt-1">
              {{ wifeRecognized ? $t('memberTransfer.wifeMatchSuccess') : $t('memberTransfer.wifeMatchFail') }}
            </p>
          </div>

          <!-- 子女规则比对展示 -->
          <div v-else-if="transferReasonType === 'child'" class="p-4 rounded-xl border text-xs space-y-2" :class="childRecognized ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'">
            <div class="font-bold flex items-center gap-1.5 text-sm">
              <el-icon><Connection /></el-icon>
              <span>{{ $t('memberTransfer.childMatchTitle') }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>家庭编号一致性：<span class="font-mono font-bold">{{ selectedMember?.familyCode === currentFamilyCode ? '完全一致 ✓' : '不一致 ✗' }}</span></div>
              <div>子女与新卡父亲姓名一致性：<span class="font-bold">{{ selectedMember?.fatherName }} vs {{ currentHeadName }}</span> ({{ selectedMember?.fatherName === currentHeadName ? '完全匹配 ✓' : '未匹配 ✗' }})</div>
            </div>
            <p class="font-medium pt-1">
              {{ childRecognized ? $t('memberTransfer.childMatchSuccess') : $t('memberTransfer.childMatchFail') }}
            </p>
          </div>

          <!-- 监护 / 抚养 / 其他规则提示 -->
          <div v-else class="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
            <div class="font-bold flex items-center gap-1.5 text-sm">
              <el-icon><InfoFilled /></el-icon>
              <span>法定监护 / 抚养 / 其他法定情形审核要求</span>
            </div>
            <p class="leading-relaxed">
              依据法规第 5.3 节规定：凡不属于妻子转移或子女转移的情形（如监护、抚养或其他原因），必须提交民事法庭出具之有效司法判决或官方监护批文，且<strong>始终须经配给分部员工及分部经理两级电子审核</strong>。
            </p>
          </div>
        </div>

        <!-- 证明转移原因的官方文件上传 -->
        <div>
          <DocumentUploader
            v-model="proofDocUploaded"
            :title="$t('memberTransfer.proofUploadTitle')"
            subtitle="结婚登记证明、医学出生公函、司法监护判决书或合法抚养文书（PDF/JPG格式）"
            is-required
            category-badge="法定关系证明"
            issuer="伊拉克内政部 / 最高司法委员会"
            :default-file-name="selectedMember?.proofDocName || '法定关系证明公文_2026.pdf'"
          />
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 3: 第 140 号决议合规核验 与 智能研判业务流转路径 -->
      <!-- ======================================================== -->
      <div v-show="currentStep === 3" class="space-y-5 animate-fade-in">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">3</span>
            <span>{{ $t('memberTransfer.step3') }}</span>
          </label>
          <el-tag :type="isArticle140Area ? 'danger' : 'success'" size="small">
            {{ isArticle140Area ? $t('memberTransfer.article140InWarning') : $t('memberTransfer.article140OutNotice') }}
          </el-tag>
        </div>

        <!-- 命中第 140 号决议的提示与公函上传 -->
        <div v-if="isArticle140Area" class="space-y-4">
          <div class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1.5">
            <div class="font-bold flex items-center gap-1.5 text-sm text-rose-900">
              <el-icon><WarningFilled /></el-icon>
              <span>特别法令警示：被转移成员原属地区命中宪法第 140 号决议覆盖范围</span>
            </div>
            <p class="leading-relaxed">
              检测到该成员当前配给关系所属为<strong>{{ selectedMember?.currentProvince }} · {{ selectedMember?.currentCenterName }}</strong>，依法属于第 140 号决议覆盖区域。国家安全与民事行政法规强制要求：必须上传由联邦内政部与第 140 号决议委员会联合出具的<strong>无异议官方公函 (No-Objection Certificate)</strong>。
            </p>
          </div>

          <DocumentUploader
            v-model="article140Uploaded"
            title="第 140 号决议官方无异议批文 (No-Objection Certificate)"
            subtitle="伊拉克联邦政府第140号决议最高委员会及内政部官方联合签发公函"
            is-required
            category-badge="第140号决议文书"
            issuer="第140号决议最高实施委员会"
            default-file-name="第140号决议转移无异议批函_2026.pdf"
          />
        </div>

        <!-- 未涉及第 140 号决议的绿色提示 -->
        <div v-else class="p-6 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-xs space-y-2">
          <div class="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <el-icon class="text-emerald-600" :size="18"><CircleCheckFilled /></el-icon>
            <span>地理区域核验：未涉及宪法第 140 号决议争议领土</span>
          </div>
          <p class="text-emerald-700 leading-relaxed">
            该成员所属原网点（{{ selectedMember?.currentProvince }}）不属于第 140 号决议特定清单，依法<strong>免于提交第 140 号决议无异议公函</strong>。
          </p>
        </div>

        <!-- 最终研判流转路径大卡片 -->
        <div class="p-4 rounded-xl border text-xs space-y-2" :class="finalPathDecision === 'auto' ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'">
          <div class="font-bold text-sm flex items-center justify-between" :class="finalPathDecision === 'auto' ? 'text-emerald-900' : 'text-amber-900'">
            <div class="flex items-center gap-1.5">
              <el-icon><Compass /></el-icon>
              <span>{{ $t('memberTransfer.pathDecisionTitle') }}</span>
            </div>
            <el-tag :type="finalPathDecision === 'auto' ? 'success' : 'warning'" effect="dark">
              {{ finalPathDecision === 'auto' ? '自动批准路径' : '两级电子审核路径' }}
            </el-tag>
          </div>
          <p class="leading-relaxed font-medium" :class="finalPathDecision === 'auto' ? 'text-emerald-800' : 'text-amber-800'">
            {{ finalPathDecision === 'auto' ? $t('memberTransfer.autoPath') : $t('memberTransfer.reviewPath') }}
          </p>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 4: 确认申请摘要与规费电子支付 -->
      <!-- ======================================================== -->
      <div v-show="currentStep === 4" class="space-y-5 animate-fade-in">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">4</span>
            <span>{{ $t('memberTransfer.step4') }}</span>
          </label>
          <el-tag :type="finalPathDecision === 'auto' ? 'success' : 'warning'" effect="dark">
            {{ finalPathDecision === 'auto' ? '系统全自动批准' : '转入分部两级电子审核' }}
          </el-tag>
        </div>

        <!-- 申请明细摘要核对卡 -->
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px]">拟移入被转移成员：</span>
            <span class="font-bold text-slate-800">{{ selectedMember?.name }} ({{ selectedMember?.nationalId }})</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">接收目标电子配给卡：</span>
            <span class="font-mono font-bold text-indigo-600">{{ citizenStore.currentFamily?.rationCardNo }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">法定申报情形：</span>
            <span class="font-bold text-slate-800">{{ getReasonTypeLabel(transferReasonType) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">法定业务流转路径：</span>
            <span class="font-bold" :class="finalPathDecision === 'auto' ? 'text-emerald-600' : 'text-amber-600'">
              {{ finalPathDecision === 'auto' ? '全自动核准生效' : '分部员工初审 + 经理终审' }}
            </span>
          </div>
        </div>

        <!-- 规费账单提示 -->
        <div class="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="text-xs text-slate-400">{{ $t('memberTransfer.feeLabel') }}</div>
            <div class="text-2xl font-bold font-mono text-emerald-400">
              5,000 IQD <span class="text-xs text-slate-400 font-normal">(伊拉克第纳尔)</span>
            </div>
          </div>
          <div class="text-xs text-slate-400 sm:text-right">
            <div>支付渠道：统一国库电子支付网关 (E-Pay)</div>
            <div class="text-[11px] text-slate-500">支持 Qi Card / Zain Cash / 银行手机网银</div>
          </div>
        </div>

        <!-- 引导进行扫码支付卡片 -->
        <div class="p-6 bg-indigo-50/50 border border-indigo-200 rounded-2xl text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <el-icon :size="24"><CreditCard /></el-icon>
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900">最后一步：完成电子支付并提交申报</h4>
            <p class="text-xs text-slate-500 mt-1">
              点击下方按钮将打开电子支付二维码收银台，手机扫码付款通过后，系统将正式受理
            </p>
          </div>
          <el-button
            type="primary"
            size="large"
            class="px-8 font-bold shadow-md bg-indigo-600 border-indigo-600 hover:bg-indigo-500"
            :loading="submitting"
            @click="paymentDialogVisible = true"
          >
            <el-icon class="mr-1.5"><Cellphone /></el-icon>
            {{ $t('memberTransfer.payAndSubmitBtn') }}
          </el-button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 底部步骤切换操作栏 (上一步 / 下一步) -->
      <!-- ======================================================== -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-100">
        <el-button
          v-if="currentStep > 1"
          size="large"
          @click="handlePrevStep"
        >
          <el-icon class="mr-1"><Back /></el-icon>
          上一步
        </el-button>
        <div v-else />

        <div>
          <el-button
            v-if="currentStep < 4"
            type="primary"
            size="large"
            class="px-6 font-bold"
            :disabled="currentStep === 1 && selectedMember && !selectedMember.isUpdatedInSystem"
            @click="handleNextStep"
          >
            下一步
            <el-icon class="ml-1"><Right /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 通用电子支付二维码收银台弹窗 -->
    <ElectronicPaymentDialog
      v-model="paymentDialogVisible"
      title="配给卡成员转移公文规费"
      :amount="5000"
      currency="IQD"
      :business-no="citizenStore.currentFamily?.rationCardNo"
      :applicant-name="citizenStore.currentFamily?.headName"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCitizenStore } from '../../stores/citizen.js';
import {
  getTransferableMemberList,
  queryTransferableMember,
  submitMemberTransfer
} from '../../api/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import {
  User,
  Back,
  Right,
  Search,
  CircleCloseFilled,
  CircleCheckFilled,
  InfoFilled,
  WarningFilled,
  Connection,
  Compass,
  CreditCard,
  Cellphone,
  Operation,
  MagicStick,
  Lock,
  Tools
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const { t } = useI18n();
const citizenStore = useCitizenStore();

// 模式管理: demo (演示自适应模拟) vs real (严格真实验证)
const verificationMode = ref('demo');
const realModeErrorMsg = ref('');
const currentScenarioKey = ref('wifeAuto');

// 步骤状态
const currentStep = ref(1);
const querying = ref(false);
const submitting = ref(false);
const paymentDialogVisible = ref(false);

// 候选池与查询状态
const demoMemberList = ref([]);
const searchNationalId = ref('198302194821'); // 默认填入标准演示国民编号（妻子·自动批准）
const selectedMember = ref(null);

// 生物识别与附件
const verifyingBiometric = ref(false);
const biometricVerified = ref(false);
const transferReasonType = ref('wife'); // wife | child | guardianship | support | other
const proofDocUploaded = ref(true);
const article140Uploaded = ref(false);

// 当前新卡与户主信息
const currentHeadName = computed(() => citizenStore.currentFamily?.headName || '艾哈迈德·哈桑·萨利赫');
const currentFamilyCode = computed(() => citizenStore.currentFamily?.familyCode || 'FAM-BAG-08832');
const currentHeadFatherName = ref('哈桑·萨利赫'); // 户主艾哈迈德的父亲姓名

onMounted(async () => {
  if (!citizenStore.currentFamily) {
    await citizenStore.fetchFamilies();
  }
  await loadDemoMembers();
});

async function loadDemoMembers() {
  try {
    const res = await getTransferableMemberList();
    const list = Array.isArray(res) ? res : (res?.data || []);
    demoMemberList.value = list;

    // 默认执行一次预设编号核验，保证页面一进入便有合法档案并可直接点击下一步
    if (searchNationalId.value) {
      await handleQueryMember();
    }
  } catch (err) {
    console.error('加载候选成员失败', err);
  }
}

// 一键填入并查询核验
function fillAndQuery(id) {
  searchNationalId.value = id;
  handleQueryMember();
}

function handleModeChange(mode) {
  realModeErrorMsg.value = '';
  if (mode === 'real') {
    if (selectedMember.value?.isDemoGenerated) {
      selectedMember.value = null;
    }
    ElMessage.info('已切换为真实验证模式，将严格核验国家内政部公民数据库');
  } else {
    ElMessage.success('已切换为演示模式，支持任意编号自适应生成与测试场景切换');
  }
}

async function handleQueryMember() {
  const qId = searchNationalId.value?.trim();
  if (!qId) {
    ElMessage.warning('请输入被转移成员国民编号');
    return;
  }

  realModeErrorMsg.value = '';
  querying.value = true;
  try {
    const res = await queryTransferableMember(qId, verificationMode.value);
    // 兼容 Axios 响应拦截器解包或未解包情况
    const memberData = (res && res.nationalId) ? res : (res?.data || null);

    if (memberData) {
      selectedMember.value = { ...memberData };
      // 若成员在系统中已更新，默认核验通过
      biometricVerified.value = memberData.isUpdatedInSystem ? true : false;
      transferReasonType.value = memberData.relationType || 'wife';
      proofDocUploaded.value = Boolean(memberData.proofDocName || true);
      article140Uploaded.value = false;

      // 自动映射当前场景预设标识
      if (!memberData.isUpdatedInSystem) {
        currentScenarioKey.value = 'notUpdated';
      } else if (memberData.relationType === 'wife' && memberData.familyCode === currentFamilyCode.value) {
        currentScenarioKey.value = 'wifeAuto';
      } else if (memberData.relationType === 'wife') {
        currentScenarioKey.value = 'wifeReview';
      } else if (memberData.relationType === 'child' && memberData.isArticle140Area) {
        currentScenarioKey.value = 'child140';
      } else if (memberData.relationType === 'child') {
        currentScenarioKey.value = 'childAuto';
      } else {
        currentScenarioKey.value = 'guardianship';
      }

      if (memberData.isDemoGenerated) {
        ElMessage.success(t('memberTransfer.demoGeneratedNotice', { id: qId }));
      } else {
        ElMessage.success(`档案核验通过：${memberData.name} (${memberData.relationLabel || '在册公民'})`);
      }
    }
  } catch (err) {
    selectedMember.value = null;
    const msg = err.message || t('memberTransfer.realNotFoundAlert', { id: qId });
    realModeErrorMsg.value = msg;
    ElMessage.error(msg);
  } finally {
    querying.value = false;
  }
}

// 快速应用测试场景预设 (极大地赋能演示与评审)
function applyScenarioPreset(key) {
  if (!selectedMember.value) return;
  currentScenarioKey.value = key;

  switch (key) {
    case 'wifeAuto':
      selectedMember.value.relationType = 'wife';
      selectedMember.value.familyCode = currentFamilyCode.value;
      selectedMember.value.fatherName = '拉希德·哈米德'; // 与哈桑·萨利赫不同
      selectedMember.value.isArticle140Area = false;
      selectedMember.value.isUpdatedInSystem = true;
      selectedMember.value.faceVerified = true;
      selectedMember.value.proofDocName = '最高司法委员会民事结婚公证书_MC.pdf';
      transferReasonType.value = 'wife';
      biometricVerified.value = true;
      proofDocUploaded.value = true;
      ElMessage.success('已切换场景：妻子转移（同家庭编号·自动识别通过）');
      break;

    case 'wifeReview':
      selectedMember.value.relationType = 'wife';
      selectedMember.value.familyCode = 'FAM-DIFF-99812'; // 家庭编号不同
      selectedMember.value.fatherName = '马吉德·卡利勒';
      selectedMember.value.isArticle140Area = false;
      selectedMember.value.isUpdatedInSystem = true;
      selectedMember.value.faceVerified = true;
      selectedMember.value.proofDocName = '异地结婚公证书与分部档案_DIY.pdf';
      transferReasonType.value = 'wife';
      biometricVerified.value = true;
      proofDocUploaded.value = true;
      ElMessage.info('已切换场景：妻子转移（家庭编号不一致·转两级人工审核）');
      break;

    case 'childAuto':
      selectedMember.value.relationType = 'child';
      selectedMember.value.familyCode = currentFamilyCode.value;
      selectedMember.value.fatherName = currentHeadName.value; // 与户主完全一致
      selectedMember.value.isArticle140Area = false;
      selectedMember.value.isUpdatedInSystem = true;
      selectedMember.value.faceVerified = true;
      selectedMember.value.proofDocName = '卫生部医学出生证明及户口记录_BC.pdf';
      transferReasonType.value = 'child';
      biometricVerified.value = true;
      proofDocUploaded.value = true;
      ElMessage.success('已切换场景：子女转移（非140地区·条件吻合·自动批准）');
      break;

    case 'child140':
      selectedMember.value.relationType = 'child';
      selectedMember.value.familyCode = currentFamilyCode.value;
      selectedMember.value.fatherName = currentHeadName.value;
      selectedMember.value.isArticle140Area = true; // 命中第140号决议
      selectedMember.value.currentProvince = '基尔库克省 (Kirkuk)';
      selectedMember.value.currentCenterName = '基尔库克第一配给中心 (#101)';
      selectedMember.value.isUpdatedInSystem = true;
      selectedMember.value.faceVerified = true;
      selectedMember.value.proofDocName = '出生证明公证书_KIR.pdf';
      transferReasonType.value = 'child';
      biometricVerified.value = true;
      proofDocUploaded.value = true;
      article140Uploaded.value = false;
      ElMessage.warning('已切换场景：子女转移（命中第140号决议·强制两级审核与无异议公函）');
      break;

    case 'guardianship':
      selectedMember.value.relationType = 'guardianship';
      selectedMember.value.familyCode = 'FAM-EXT-33012';
      selectedMember.value.isArticle140Area = false;
      selectedMember.value.isUpdatedInSystem = true;
      selectedMember.value.faceVerified = true;
      selectedMember.value.proofDocName = '民事法庭法定监护终审判决公函_GD.pdf';
      transferReasonType.value = 'guardianship';
      biometricVerified.value = true;
      proofDocUploaded.value = true;
      ElMessage.info('已切换场景：法定监护（司法裁决·转两级人工审核）');
      break;

    case 'notUpdated':
      selectedMember.value.isUpdatedInSystem = false; // 红线拦截
      selectedMember.value.faceVerified = false;
      biometricVerified.value = false;
      ElMessage.error('已切换场景：受限成员（未在系统更新·红线拦截禁止下一步）');
      break;
  }
}

function handleDoBiometric() {
  verifyingBiometric.value = true;
  setTimeout(() => {
    verifyingBiometric.value = false;
    biometricVerified.value = true;
    ElMessage.success('被转移成员活体人脸及生物识别比对通过！');
  }, 600);
}

// ==========================================
// 核心规则引擎比对与路径裁决计算 (第 5 & 8 节)
// ==========================================

// 妻子识别机制：同家庭编号且双方父亲姓名不同
const wifeRecognized = computed(() => {
  if (!selectedMember.value) return false;
  const sameFamilyCode = selectedMember.value.familyCode === currentFamilyCode.value;
  const diffFather = selectedMember.value.fatherName !== currentHeadFatherName.value;
  return sameFamilyCode && diffFather;
});

// 子女识别机制：同家庭编号且子女父亲名字与新卡户主一致
const childRecognized = computed(() => {
  if (!selectedMember.value) return false;
  const sameFamilyCode = selectedMember.value.familyCode === currentFamilyCode.value;
  const sameFatherName = selectedMember.value.fatherName === currentHeadName.value;
  return sameFamilyCode && sameFatherName;
});

// 是否命中第140号决议地区
const isArticle140Area = computed(() => {
  return Boolean(selectedMember.value?.isArticle140Area);
});

// 最终路径智能裁决：auto (全自动) vs review (两级电子审核)
const finalPathDecision = computed(() => {
  if (!selectedMember.value) return 'review';

  // 1. 妻子转移
  if (transferReasonType.value === 'wife') {
    // 依据第 5.1 节：在第140号决议地区以内或以外，当妻子被自动识别时，一律自动批准！
    if (wifeRecognized.value) {
      return 'auto';
    }
    return 'review';
  }

  // 2. 子女转移
  if (transferReasonType.value === 'child') {
    // 依据第 5.2 节：在第140号地区以内，子女转移始终须经配给分部员工电子审核
    if (isArticle140Area.value) {
      return 'review';
    }
    // 在第140号地区以外：满足双重条件则自动批准，否则电子审核
    if (childRecognized.value) {
      return 'auto';
    }
    return 'review';
  }

  // 3. 监护 / 抚养 / 其他原因：始终经两级电子审核
  return 'review';
});

// 步骤前进控制
function handleNextStep() {
  if (currentStep.value === 1) {
    if (!selectedMember.value) {
      ElMessage.warning('请先输入被转移成员国民编号并点击【查询档案并核验】');
      return;
    }
    if (!selectedMember.value.isUpdatedInSystem) {
      ElMessage.error('【法定红线拦截】：该成员在配给卡系统中尚未更新，国家法令严禁办理转移！');
      return;
    }
    if (!biometricVerified.value) {
      ElMessage.warning('请先完成被转移成员的生物识别核验');
      return;
    }
  } else if (currentStep.value === 2) {
    if (!proofDocUploaded.value) {
      ElMessage.warning('请上传证明转移原因的官方证明文件');
      return;
    }
  } else if (currentStep.value === 3) {
    if (isArticle140Area.value && !article140Uploaded.value) {
      ElMessage.warning('涉及第140号决议争议地区，必须上传第 140 号决议官方无异议批函');
      return;
    }
  }

  if (currentStep.value < 4) {
    currentStep.value++;
  }
}

function handlePrevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function getReasonTypeLabel(type) {
  const map = {
    wife: '妻子转移 (配偶婚姻移入)',
    child: '子女转移 (婚生子女迁入)',
    guardianship: '法定监护 (法院司法裁决)',
    support: '亲属抚养 (社会救济抚养)',
    other: '其他法定特殊原因'
  };
  return map[type] || type;
}

// 电子支付成功回调，正式提交业务申请
async function handlePaymentSuccess(payResult) {
  submitting.value = true;
  try {
    const payload = {
      nationalId: selectedMember.value.nationalId,
      transferReasonType: transferReasonType.value,
      proofDocName: selectedMember.value.proofDocName || '法定关系证明公文_2026.pdf',
      article140DocName: isArticle140Area.value ? '第140号决议转移无异议批函_2026.pdf' : '',
      paymentTxId: payResult?.txId || `PAY-MT-${Date.now()}`,
      paidAmount: 5000
    };

    const res = await submitMemberTransfer(payload);
    const msg = res?.message || res?.data?.message || '成员转移申请提交成功！';
    ElMessage.success(msg);

    // 重新获取家庭数据并返回
    await citizenStore.fetchFamilies();
    setTimeout(() => {
      router.push('/citizen');
    }, 1500);
  } catch (err) {
    ElMessage.error(err.message || '提交失败，请重试');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.5s ease-in-out;
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
