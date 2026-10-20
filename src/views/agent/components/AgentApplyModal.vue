<template>
  <el-dialog
    v-model="visible"
    :title="isEn ? 'Apply for Ration Agent License (New Station)' : '申请配给代理权 (授予新代销网点)'"
    width="840px"
    destroy-on-close
    :close-on-click-modal="false"
    class="agent-apply-modal"
  >
    <div class="space-y-5">
      <!-- 顶部政策通告栏 (已精简) -->
      <div class="p-3 bg-[#FDF3E0]/80 border border-[#F2E3C6]/90 rounded-lg text-xs flex items-center justify-between text-[#5A4718]">
        <div class="flex items-center gap-2">
          <el-icon class="text-[#C9A13B]"><WarningFilled /></el-icon>
          <span class="text-[11px]">{{ isEn ? 'The applied center must be a vacant/cancelled outlet; priority for 3-gen relatives; pay 250,000 IQD fee upon field verification.' : '拟申请中心须为已注销空置网点；优先授予三代内亲属；实地核查通过后缴纳 250,000 IQD 规费。' }}</span>
        </div>
        <el-tag size="small" type="warning" effect="light">{{ isEn ? 'Fee: 250,000 IQD' : '规费 250,000 IQD' }}</el-tag>
      </div>

      <!-- 4 步骤条导航 -->
      <el-steps :active="activeStep" finish-status="success" align-center class="my-2">
        <el-step :title="isEn ? 'Step 1' : '第 1 步'" :description="isEn ? 'Center & Qualification' : '选择中心与资格核验'" />
        <el-step :title="isEn ? 'Step 2' : '第 2 步'" :description="isEn ? 'Upload Proof Documents' : '上传对应证明附件'" />
        <el-step :title="isEn ? 'Step 3' : '第 3 步'" :description="isEn ? 'Committee Joint Review' : '自动与委员会联合审核'" />
        <el-step :title="isEn ? 'Step 4' : '第 4 步'" :description="isEn ? 'Electronic Payment' : '电子支付与完成申请'" />
      </el-steps>

      <!-- ======================================================== -->
      <!-- 步骤 1: 选择目标中心与申请人资格核验 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 0" class="space-y-4">
        <div class="bg-[#F3F8F4] p-4 rounded-lg border border-[#D9E5DB] space-y-4">
          <h4 class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5">
            <el-icon class="text-[#326445]"><Location /></el-icon>
            <span>{{ isEn ? 'Target Ration Center (Must be vacant / cancelled)' : '拟申请授予的配给中心 (必须为已注销/空置中心)' }}</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span class="block text-xs font-semibold text-[#58685D] mb-1">{{ isEn ? 'Select Ration Center' : '选择配给中心' }} <span class="text-[#C04442]">*</span></span>
              <el-select
                v-model="form.centerId"
                :placeholder="isEn ? 'Select target center (keyword search supported)' : '请选择拟申请配给中心 (支持输入关键字搜索)'"
                class="w-full"
                filterable
                @change="handleCenterSelect"
              >
                <el-option
                  v-for="c in centerOptions"
                  :key="c.centerId"
                  :label="`[${c.province}] ${c.city ? c.city + ' - ' : ''}${c.centerName} (${c.status})`"
                  :value="c.centerId"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span :class="{'text-[#C04442] font-bold': c.status === '已被代理' || c.status === 'Assigned'}">
                      <span v-if="c.isArticle140" class="text-[#D3AF62] font-bold me-1">★</span>{{ c.centerName }}
                      <span v-if="c.city" class="text-[11px] text-[#8A9A8F] font-normal ms-1">({{ c.province }} · {{ c.city }})</span>
                    </span>
                    <div class="flex items-center gap-1">
                      <el-tag v-if="c.isArticle140" size="small" type="warning" effect="dark" class="scale-90">{{ isEn ? 'Article 140' : '140号决议' }}</el-tag>
                      <el-tag size="small" :type="(c.status === '已被代理' || c.status === 'Assigned') ? 'danger' : 'success'">
                        {{ c.status }}
                      </el-tag>
                    </div>
                  </div>
                </el-option>
              </el-select>
            </div>

            <div>
              <span class="block text-xs font-semibold text-[#58685D] mb-1">{{ isEn ? 'Business Category' : '经营品类选择' }} <span class="text-[#C04442]">*</span></span>
              <el-select v-model="form.category" class="w-full">
                <el-option :label="isEn ? 'Flour Agency License' : '面粉专项代理权 (Flour)'" value="面粉" />
                <el-option :label="isEn ? 'Food Strategic Supplies License' : '食品战略物资代理权 (Food)'" value="食品" />
                <el-option :label="isEn ? 'General Agency License (Food + Flour)' : '综合代销代理权 (Food + Flour)'" value="综合 (食品+面粉)" />
              </el-select>
            </div>
          </div>

          <!-- 中心状态前置拦截提示 (已精简) -->
          <div v-if="selectedCenter" class="p-2.5 rounded-lg border text-xs" :class="(selectedCenter.status === '已被代理' || selectedCenter.status === 'Assigned') ? 'bg-[#FBEAE9] border-[#F2D5D4] text-[#6E2F2E]' : 'bg-[#EFF5F1] border-[#C7E0CE] text-[#24483A]'">
            <div class="flex items-center gap-2">
              <el-icon class="text-sm" :class="(selectedCenter.status === '已被代理' || selectedCenter.status === 'Assigned') ? 'text-[#C04442]' : 'text-[#2F7A50]'">
                <component :is="(selectedCenter.status === '已被代理' || selectedCenter.status === 'Assigned') ? 'CircleCloseFilled' : 'SuccessFilled'" />
              </el-icon>
              <div class="flex-1 flex items-center justify-between">
                <span class="font-medium text-[11px]">
                  <span v-if="selectedCenter.status === '已被代理' || selectedCenter.status === 'Assigned'">
                    {{ isEn ? `This center already has an active agent [${selectedCenter.currentAgentName}]. Current license must be revoked first.` : `该中心已有在任代理人【${selectedCenter.currentAgentName}】，须先注销现有代理权后方可重新申请。` }}
                  </span>
                  <span v-else>
                    {{ isEn ? 'This center is vacant/deregistered, meeting legal criteria for application.' : '该中心为已注销空置网点，符合准入申报条件。' }}
                  </span>
                </span>
                <el-tag v-if="selectedCenter.isArticle140" size="small" type="warning" effect="dark" class="scale-90">{{ isEn ? 'Article 140' : '第140号决议' }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 申请人资质与法定排他条件校验 -->
        <div class="bg-[#F3F8F4] p-4 rounded-lg border border-[#D9E5DB] space-y-3">
          <h4 class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5">
            <el-icon class="text-[#326445]"><User /></el-icon>
            <span>{{ isEn ? 'Applicant Info & Statutory Exclusion Verification' : '申请人基本信息与法定排他资质核查' }}</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span class="block text-xs text-[#58685D] mb-1">{{ isEn ? 'Applicant Full Name' : '申请人真实姓名' }} <span class="text-[#C04442]">*</span></span>
              <el-input v-model="form.applicantName" :placeholder="isEn ? 'e.g., Mohammed Jabbar' : '例如：穆罕默德·贾巴尔'" />
            </div>
            <div>
              <span class="block text-xs text-[#58685D] mb-1">{{ isEn ? 'National ID (UID)' : '国民身份证号 (National ID)' }} <span class="text-[#C04442]">*</span></span>
              <el-input v-model="form.applicantNationalId" :placeholder="isEn ? '12-digit national identification number' : '12位国家统一身份编号'" />
            </div>
            <div>
              <span class="block text-xs text-[#58685D] mb-1">{{ isEn ? 'Applicant Age' : '候选人年龄 (周岁)' }} <span class="text-[#C04442]">*</span></span>
              <el-input-number v-model="form.applicantAge" :min="16" :max="65" class="w-full" />
              <span class="text-[10px] text-[#8A9A8F]">{{ isEn ? 'Statutory range: 18 - 48 years old' : '法定红线：18 至 48 周岁之间' }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span class="block text-xs text-[#58685D] mb-1">{{ isEn ? 'Ministerial Approval Reference' : '部长批准公函文号' }} <span class="text-[#C04442]">*</span></span>
              <el-input v-model="form.ministerApprovalNo" placeholder="MO-TRD-MIN-2026-8812" />
            </div>
            <div>
              <span class="block text-xs text-[#58685D] mb-1">{{ isEn ? 'Education Qualification' : '学历证明层级' }} <span class="text-[#C04442]">*</span></span>
              <el-select v-model="form.educationLevel" class="w-full">
                <el-option :label="isEn ? 'Primary School Cert (Min Requirement)' : '经教育部认证的小学毕业证书 (最低要求)'" value="PRIMARY" />
                <el-option :label="isEn ? 'Secondary / High School Diploma' : '初中或普通高中毕业证书'" value="SECONDARY" />
                <el-option :label="isEn ? 'College / University Degree or Higher' : '大专或全日制本科及以上文凭'" value="HIGHER" />
              </el-select>
            </div>
          </div>

          <!-- 法定排他条件承诺选择 (全部必勾) -->
          <div class="pt-2 border-t border-[#D9E5DB]/60 space-y-2 text-xs text-[#43554B]">
            <el-checkbox v-model="form.isResidentInDistrict">
              <strong>{{ isEn ? 'Permanent Resident Commitment' : '本辖区常住居民承诺' }}</strong>：{{ isEn ? 'The applicant is a legal permanent resident of the service district with official registry.' : '申请人确为相关家庭所在地区的法定常住居民，并持有街道户籍证明。' }}
            </el-checkbox>
            <br />
            <el-checkbox v-model="form.isNonPublicEmployee">
              <strong>{{ isEn ? 'Exclusion of Public Employment' : '非公职身份排他承诺' }}</strong>：{{ isEn ? 'The applicant is not a student, public employee, military, company owner/shareholder, or recipient of state salary.' : '申请人不得为学生、雇员、军人、公司所有者或股东或承包商，且不得以任何名义领取国家工资。' }}
            </el-checkbox>
            <br />
            <el-checkbox v-model="form.isNoFamilyAgentDuplication">
              <strong>{{ isEn ? 'Family Non-Duplication Commitment' : '家庭排他承诺' }}</strong>：{{ isEn ? 'Neither spouse nor unmarried children hold any ration agency license.' : '申请人配偶（丈夫/妻子）及其未婚子女名下均未持有代理权，不构成重复持权。' }}
            </el-checkbox>
            <br />
            <el-checkbox v-model="form.hasKinshipPriority">
              <strong>{{ isEn ? 'Kinship Priority Declaration' : '亲属优先声明' }}</strong>：{{ isEn ? 'Applicant is a relative within 3 degrees of the original agent (entitled to legal priority if cancellation was not for malpractice).' : '本人为原代理的三代以内亲属（若原代理权非因违法处罚被注销，依法享有优先授予权）。' }}
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 2: 上传对应证明附件 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 1" class="space-y-4">
        <div class="p-3 bg-[#EFF5F1]/70 border border-[#C7DED0] rounded-lg text-xs text-[#24483A]">
          依据《贸易部代理权准入规程》，请逐项上传原件高清扫描件（支持 PDF/JPG/PNG，单文件不超过 15MB）。
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <!-- 附件 1 -->
          <div class="p-3 bg-white border border-[#D9E5DB] rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326]">1. 部长批准授予代理权公函 <span class="text-[#C04442]">*</span></span>
              <el-tag size="small" type="success" effect="plain">必需批件</el-tag>
            </div>
            <p class="text-[11px] text-[#58685D]">贸易部部长正式签发的食品或面粉代理权电子批准批文。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docMinister', f)">
                <el-button size="small" type="primary" plain><el-icon class="me-1"><Upload /></el-icon>点击上传公函</el-button>
              </el-upload>
              <span class="text-[11px] text-[#2F7A50] font-medium truncate">{{ docs.docMinister?.name || '已自动装载默认批文' }}</span>
            </div>
          </div>

          <!-- 附件 2 -->
          <div class="p-3 bg-white border border-[#D9E5DB] rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326]">2. 30%服务家庭拇指印同意书 <span class="text-[#C04442]">*</span></span>
              <el-tag size="small" type="success" effect="plain">法定民意</el-tag>
            </div>
            <p class="text-[11px] text-[#58685D]">已注销代理权30%家庭同意书，按捺拇指印并附配给卡复印件。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docFamilies', f)">
                <el-button size="small" type="primary" plain><el-icon class="me-1"><Upload /></el-icon>上传联署名册</el-button>
              </el-upload>
              <span class="text-[11px] text-[#2F7A50] font-medium truncate">{{ docs.docFamilies?.name || '已上传 (附240户按印底册)' }}</span>
            </div>
          </div>

          <!-- 附件 3 -->
          <div class="p-3 bg-white border border-[#D9E5DB] rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326]">3. 申请人有效身份与学历认证 <span class="text-[#C04442]">*</span></span>
              <el-tag size="small" type="success" effect="plain">身份与学历</el-tag>
            </div>
            <p class="text-[11px] text-[#58685D]">国家统一国民卡正反面及教育部认证小学毕业证书扫描件。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docIdentity', f)">
                <el-button size="small" type="primary" plain><el-icon class="me-1"><Upload /></el-icon>上传身份学历</el-button>
              </el-upload>
              <span class="text-[11px] text-[#2F7A50] font-medium truncate">{{ docs.docIdentity?.name || '已上传国民卡及毕业证' }}</span>
            </div>
          </div>

          <!-- 附件 4 -->
          <div class="p-3 bg-white border border-[#D9E5DB] rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326]">4. 经营场所产权证或公证租赁合同 <span class="text-[#C04442]">*</span></span>
              <el-tag size="small" type="success" effect="plain">场地证明</el-tag>
            </div>
            <p class="text-[11px] text-[#58685D]">公证处认证房产合同（农业用地附卡伊马卡米亚市政外函）。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docProperty', f)">
                <el-button size="small" type="primary" plain><el-icon class="me-1"><Upload /></el-icon>上传场地公证书</el-button>
              </el-upload>
              <span class="text-[11px] text-[#2F7A50] font-medium truncate">{{ docs.docProperty?.name || '已上传公证租赁合同' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 3: 自动与委员会联合审核推进 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 2" class="space-y-4">
        <!-- 自动机审状态卡片 -->
        <div class="p-4 bg-[#EFF5F1] border border-[#C7E0CE] rounded-lg space-y-2">
          <div class="flex items-center gap-2 text-[#24483A] font-bold text-xs">
            <el-icon class="text-base"><CircleCheckFilled /></el-icon>
            <span>国家数字化系统第一阶段：自动规则校验全部合格</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#12241A]">
            <div>• 候选人年龄：{{ form.applicantAge }} 岁 (合格)</div>
            <div>• 非公职状态：联网核验无薪俸</div>
            <div>• 中心状态：空置已注销网点</div>
            <div>• 亲属优先权：第3代直系在册</div>
          </div>
        </div>

        <!-- 联合委员会实地检查与考核模拟 -->
        <div class="bg-white border border-[#D9E5DB] p-4 rounded-lg space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5">
              <el-icon class="text-[#C9A13B]"><Stamp /></el-icon>
              <span>第二阶段：巴格达/各省联合实地检查委员会核验 (代理义务第7款)</span>
            </h4>
            <el-tag size="small" type="warning" effect="light">现场检查通过</el-tag>
          </div>
          <p class="text-[11px] text-[#58685D]">
            由配给分部、规划与跟进司、商业监督司（观察员成员）及粮食公司组成的联合委员会，已实地核查拟设网点经营面积、卫生防疫与防潮防火设施。
          </p>

          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] rounded-lg border border-[#E9F1EB]">
              <span class="font-medium text-[#43554B]">1. 配给分部现场检查代表</span>
              <span class="text-[#2F7A50] font-bold flex items-center gap-1"><el-icon><Check /></el-icon>实地验收通过 (营业面积 42㎡ 达标)</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] rounded-lg border border-[#E9F1EB]">
              <span class="font-medium text-[#43554B]">2. 规划与跟进司合规代表</span>
              <span class="text-[#2F7A50] font-bold flex items-center gap-1"><el-icon><Check /></el-icon>30%家庭拇指印名单比对无误</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] rounded-lg border border-[#E9F1EB]">
              <span class="font-medium text-[#43554B]">3. 商业与财务监督司 (观察员成员)</span>
              <span class="text-[#2F7A50] font-bold flex items-center gap-1"><el-icon><Check /></el-icon>观察员核签无异议</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 4: 电子规费支付与完成申请 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 3" class="space-y-4">
        <div class="p-4 bg-[#1B3123] text-white rounded-lg space-y-3">
          <div class="flex items-center justify-between border-b border-[#1F3326] pb-3">
            <div>
              <span class="text-xs text-[#8A9A8F] block">法定规费收取部门</span>
              <span class="text-sm font-bold text-[#DFC08B]">规划与跟进司 / 分支机构财务专户</span>
            </div>
            <div class="text-end">
              <span class="text-xs text-[#8A9A8F] block">应缴纳法定规费</span>
              <span class="text-xl font-bold font-mono text-[#6FBF92]">250,000 IQD</span>
              <span class="text-[10px] text-[#8A9A8F] block">(二十五万伊拉克第纳尔)</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs text-[#C9DBCE]">
            <div>授权中心：{{ selectedCenter?.centerName }}</div>
            <div>经营品类：{{ form.category }}</div>
            <div>申请人：{{ form.applicantName }}</div>
            <div>部长批文：{{ form.ministerApprovalNo }}</div>
          </div>
        </div>

        <div class="bg-[#F3F8F4] p-4 rounded-lg border border-[#D9E5DB] space-y-3 text-xs">
          <span class="block font-bold text-[#1F3326]">选择伊拉克国家电子支付通道：</span>
          <div class="grid grid-cols-3 gap-3">
            <div
              class="p-3 rounded-lg border cursor-pointer text-center transition-all"
              :class="payChannel === 'QI_CARD' ? 'bg-[#EFF5F1] border-[#326445] text-[#2A5440] font-bold shadow-xs' : 'bg-white border-[#D9E5DB] text-[#58685D]'"
              @click="payChannel = 'QI_CARD'"
            >
              <div class="text-sm font-bold">QI Card</div>
              <div class="text-[10px] text-[#8A9A8F] mt-1">国家银联数字卡</div>
            </div>
            <div
              class="p-3 rounded-lg border cursor-pointer text-center transition-all"
              :class="payChannel === 'ZAIN_CASH' ? 'bg-[#EFF5F1] border-[#326445] text-[#2A5440] font-bold shadow-xs' : 'bg-white border-[#D9E5DB] text-[#58685D]'"
              @click="payChannel = 'ZAIN_CASH'"
            >
              <div class="text-sm font-bold">ZainCash</div>
              <div class="text-[10px] text-[#8A9A8F] mt-1">移动电子钱包</div>
            </div>
            <div
              class="p-3 rounded-lg border cursor-pointer text-center transition-all"
              :class="payChannel === 'CENTRAL_BANK' ? 'bg-[#EFF5F1] border-[#326445] text-[#2A5440] font-bold shadow-xs' : 'bg-white border-[#D9E5DB] text-[#58685D]'"
              @click="payChannel = 'CENTRAL_BANK'"
            >
              <div class="text-sm font-bold">国库专户直联</div>
              <div class="text-[10px] text-[#8A9A8F] mt-1">财政统一清算号</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="flex items-center justify-between">
        <el-button @click="visible = false">{{ $t('common.cancel') || '取消' }}</el-button>
        <div class="space-x-2">
          <el-button v-if="activeStep > 0" @click="activeStep--">{{ isEn ? 'Previous' : '上一步' }}</el-button>
          <el-button
            v-if="activeStep < 3"
            type="primary"
            :disabled="!canProceedNextStep"
            @click="handleNext"
          >
            {{ isEn ? 'Next Step' : '下一步' }}
          </el-button>
          <el-button
            v-else
            type="success"
            :loading="submitting"
            @click="handleSubmitAndPay"
          >
            <el-icon class="me-1"><Check /></el-icon>
            {{ isEn ? 'Pay 250,000 IQD & Issue Grant' : '确认电子支付 250,000 IQD 并生成授权' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { submitAgentGrantApplication, payAgentApplicationFee } from '../../../api/agent.js';
import {
  WarningFilled,
  Location,
  User,
  Upload,
  Stamp,
  CircleCheckFilled,
  CircleCloseFilled,
  SuccessFilled,
  Check
} from '@element-plus/icons-vue';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const props = defineProps({
  centerOptions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['success']);

const visible = ref(false);
const activeStep = ref(0);
const submitting = ref(false);
const payChannel = ref('QI_CARD');

const form = reactive({
  centerId: '',
  category: '综合 (食品+面粉)',
  applicantName: computed(() => isEn.value ? 'Mohammed Jabbar Rashid' : '穆罕默德·贾巴尔·拉希德').value,
  applicantNationalId: '197803120019',
  applicantAge: 38,
  ministerApprovalNo: 'MO-TRD-MIN-2026-0819',
  educationLevel: 'PRIMARY',
  isResidentInDistrict: true,
  isNonPublicEmployee: true,
  isNoFamilyAgentDuplication: true,
  hasKinshipPriority: true
});

const docs = reactive({
  docMinister: { name: '贸易部部长批准公函.pdf' },
  docFamilies: { name: '30%服务家庭拇指印同意书.pdf' },
  docIdentity: { name: '申请人国民卡及小学毕业证.pdf' },
  docProperty: { name: '公证租赁经营合同.pdf' }
});

function syncBilingualDefaults() {
  if (isEn.value) {
    form.applicantName = 'Mohammed Jabbar Rashid';
    docs.docMinister = { name: 'Minister_Approval_Letter_2026.pdf' };
    docs.docFamilies = { name: '30_Percent_Household_Thumbprint_Consent.pdf' };
    docs.docIdentity = { name: 'National_ID_and_Primary_Diploma.pdf' };
    docs.docProperty = { name: 'Notarized_Lease_Contract.pdf' };
  } else {
    form.applicantName = '穆罕默德·贾巴尔·拉希德';
    docs.docMinister = { name: '贸易部部长批准公函.pdf' };
    docs.docFamilies = { name: '30%服务家庭拇指印同意书.pdf' };
    docs.docIdentity = { name: '申请人国民卡及小学毕业证.pdf' };
    docs.docProperty = { name: '公证租赁经营合同.pdf' };
  }
}

watch(isEn, () => syncBilingualDefaults(), { immediate: true });

const selectedCenter = computed(() => {
  return props.centerOptions.find((c) => c.centerId === form.centerId);
});

// 下一步可通行条件判断
const canProceedNextStep = computed(() => {
  if (activeStep.value === 0) {
    if (!form.centerId) return false;
    // 核心前置拦截：中心当前不能已被代理！
    if (selectedCenter.value?.status === '已被代理') return false;
    if (form.applicantAge < 18 || form.applicantAge > 48) return false;
    if (!form.isNonPublicEmployee || !form.isResidentInDistrict || !form.isNoFamilyAgentDuplication) return false;
    if (!form.ministerApprovalNo) return false;
    return true;
  }
  return true;
});

function handleCenterSelect(id) {
  const target = props.centerOptions.find((c) => c.centerId === id);
  if (target && target.status === '已被代理') {
    ElMessage.warning((isEnNow() ? `[Compliance Interception]: Center [${target.centerName}] is currently delegated; deregister the agency before applying!` : `【合规拦截】：中心【${target.centerName}】当前已被代理，须先注销代理方可申请！`));
  }
}

function handleFileChange(key, file) {
  docs[key] = { name: file.name };
  ElMessage.success((isEnNow() ? `File [${file.name}] selected successfully` : `文件【${file.name}】已成功选定`));
}

function handleNext() {
  if (activeStep.value === 0 && selectedCenter.value?.status === '已被代理') {
    ElMessageBox.alert(
      `配给中心【${selectedCenter.value.centerName}】当前已被代理，必须先由现有代理人注销该代理权，才能开放申请。`,
      '合规拦截',
      { type: 'error' }
    );
    return;
  }
  activeStep.value++;
}

async function handleSubmitAndPay() {
  submitting.value = true;
  try {
    // 1. 提交新代理权申请
    const res = await submitAgentGrantApplication({
      ...form,
      applicantAge: form.applicantAge
    });

    // 2. 模拟发起电子支付 250,000 IQD
    await payAgentApplicationFee(res.ticketNo, { channel: payChannel.value });

    ElMessage.success({
      message: `恭喜！代理权授予申请已成功通过，已电子缴纳 250,000 IQD 规费并颁发许可！`,
      duration: 4000
    });

    visible.value = false;
    emit('success');
  } catch (err) {
    // 异常拦截提示已在 client 统一处理
  } finally {
    submitting.value = false;
  }
}

function open(presetCenterId = '') {
  visible.value = true;
  activeStep.value = 0;
  if (presetCenterId) {
    form.centerId = String(presetCenterId);
  }
}

defineExpose({ open });
</script>
