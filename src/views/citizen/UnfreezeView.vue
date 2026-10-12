<template>
  <div class="unfreeze-view space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div>
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <el-icon class="text-amber-500"><Unlock /></el-icon>
          <span>数字配给卡冻结状态申诉与解冻申请</span>
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          支持因商业注销、旅行归国、薪资核定、社区网格复查等 8 大法定解冻情形提交对应官方证明材料。
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 左侧：情形选择与对应证明材料上传 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              申请解冻的法定情形 (支持全部 8 大情形)
            </label>
            <el-select v-model="unfreezeType" class="w-full" size="large" @change="handleTypeChange">
              <el-option label="1. 商业 (需上传：商业注销证明或非营利纳税清算函)" value="商业" />
              <el-option label="2. 旅行 (需上传：海关入境归国护照戳记及回国证明)" value="旅行" />
              <el-option label="3. 高收入 (需上传：财政/税务用人单位最新月薪核算单)" value="高收入" />
              <el-option label="4. 住址不明 (需上传：所属社区民政网格常住证明)" value="住址不明" />
              <el-option label="5. 更新 (需上传：统一国民卡最新更正档案确认公函)" value="更新" />
              <el-option label="6. 重复 (需上传：户政唯一身份申明公证书及销重证明)" value="重复" />
              <el-option label="7. 临时 (需上传：临时限制解除官方通告书)" value="临时" />
              <el-option label="8. 地理位置 (需上传：属地居住公证与实地定位核验件)" value="地理位置" />
            </el-select>
          </div>

          <!-- 独立证明材料上传组件 -->
          <div>
            <DocumentUploader
              v-model="unfreezeFileUploaded"
              :title="currentDocConfig.title"
              :subtitle="currentDocConfig.subtitle"
              :category-badge="currentDocConfig.badge"
              :issuer="currentDocConfig.issuer"
              :default-file-name="currentDocConfig.fileName"
              :default-ref-no="currentDocConfig.refNo"
              :ocr-summary="currentDocConfig.ocrSummary"
              :is-required="true"
            />
          </div>
        </div>

        <!-- 右侧：申诉陈述与审核须知 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              申诉陈述与解冻详细理由说明
            </label>
            <el-input
              v-model="unfreezeStatement"
              type="textarea"
              :rows="4"
              placeholder="请陈述详细解冻理由..."
            />
          </div>

          <div class="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-blue-800 space-y-1">
            <div class="font-bold">审核流转须知：</div>
            <p>
              本申诉提交后将生成工单自动转入<strong>【电子审核工作台】</strong>，经分部员工初审与分部经理终审双岗确认后，系统将自动恢复其配给资格与每月粮油面粉指标。
            </p>
          </div>

          <div class="pt-4">
            <el-button
              type="warning"
              size="large"
              class="w-full font-bold shadow-md"
              :loading="submitting"
              @click="handleSubmitUnfreeze"
            >
              提交解冻申请 (转入电子审核工作台)
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCitizenStore } from '../../stores/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import { Unlock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const citizenStore = useCitizenStore();

const unfreezeType = ref('商业');
const unfreezeFileUploaded = ref(true);
const unfreezeStatement = ref('该商户名额已于2026年正式注销并完成清税，申请恢复食品配给。');
const submitting = ref(false);

const DOC_CONFIGS = {
  商业: {
    title: '商业登记注销公文与税务清算核定函',
    subtitle: '贸易部企业注册总局注销证明及税务局清税证明',
    badge: '商业登记与税务清算',
    issuer: '伊拉克贸易部企业注册总局 & 国家税务局',
    fileName: '商业总商会与税务局_商户执照注销与清税核定公函_COM-2026-0914.pdf',
    refNo: 'COM-TAX-2026-9901',
    ocrSummary: '企业法人营业执照名额已注销，纳税零申报及税务清算完毕，符合配给补贴恢复标准'
  },
  旅行: {
    title: '海关出入境与永久回国居留公证书',
    subtitle: '海关边检入境戳记及出入境常住定居证明',
    badge: '海关出入境与永久居留',
    issuer: '伊拉克内政部居留与边境总局',
    fileName: '内政部海关边检_入境戳记护照扫描件及回国定居申明_TRV-2026-5521.pdf',
    refNo: 'CUST-TRV-2026-4418',
    ocrSummary: '巴格达国际机场入境戳记核实属实，居留常驻伊拉克境内声明经公证生效'
  },
  高收入: {
    title: '财政薪资核定单与雇主证明',
    subtitle: '财政部薪资发放底册核算公文',
    badge: '财政薪资核定与雇主证明',
    issuer: '财政部公共薪资核准司 & 雇主单位',
    fileName: '财政部与雇主用人单位_最新月收入核定单与社保证明_INC-2026-3108.pdf',
    refNo: 'FIN-SAL-2026-7821',
    ocrSummary: '月度核算收入低于国家配给补助门槛标准，雇主公章与税单一致'
  },
  住址不明: {
    title: '社区网格户籍实地核查公函',
    subtitle: '社区网格长连续居住证明与水电账单',
    badge: '社区网格户籍实地核查',
    issuer: '巴格达省地方行政委员会 & 社区网格处',
    fileName: '地方社区行政处_网格长常住户籍确认公函与水电账单_LOC-2026-7740.pdf',
    refNo: 'LOC-GRD-2026-1193',
    ocrSummary: '社区网格员现场入户核验属实，已连续常住超过6个月，地址有效激活'
  },
  更新: {
    title: '统一国民卡数据校正批准通知书',
    subtitle: '内政部户政总局更正证明',
    badge: '统一国民卡档案更正',
    issuer: '内政部统一国民卡户政局',
    fileName: '内政部户政总局_国家统一国民卡数据校正批准通知书_UPD-2026-6219.pdf',
    refNo: 'NID-UPD-2026-5532',
    ocrSummary: '统一国民卡数据库记录已更正，户籍底账与生物特征重新同步'
  },
  重复: {
    title: '最高民事法院唯一身份法定公证书',
    subtitle: '最高民政法院唯一身份申明及销重证明',
    badge: '司法唯一身份公证',
    issuer: '最高民事法院与户政注销处',
    fileName: '最高民政法院_唯一身份法定公证书及重复配给卡注销回执_DUP-2026-8831.pdf',
    refNo: 'DUP-CAN-2026-3390',
    ocrSummary: '重复卡号已依法注销并封存档案，当事人唯一合法配给卡已锁定'
  },
  临时: {
    title: '解除临时配给限制官方通告函',
    subtitle: '配给监管局撤回临时限制批复',
    badge: '临时管制措施核销',
    issuer: '贸易部食品配给监管与安全审计局',
    fileName: '贸易部配给监管局_解除临时配给限制批复公文_TMP-2026-1402.pdf',
    refNo: 'REG-TMP-2026-8812',
    ocrSummary: '临时行政核查周期结束，限制措施已撤回，配发配额全额恢复'
  },
  地理位置: {
    title: '属地常住住宅网格坐标测绘公证书',
    subtitle: '国家土地测绘局常住网格证明',
    badge: '测绘坐标公证与属地核验',
    issuer: '国家土地测绘局 & 市政规划委员会',
    fileName: '国家测绘局与市政厅_常住住宅地理网格坐标测绘公证书_GEO-2026-9903.pdf',
    refNo: 'GEO-SUR-2026-6641',
    ocrSummary: '住宅地理坐标符合巴格达卡尔赫网格化配给中心服务半径'
  }
};

const currentDocConfig = computed(() => {
  return DOC_CONFIGS[unfreezeType.value] || DOC_CONFIGS['商业'];
});

function handleTypeChange() {
  unfreezeFileUploaded.value = true;
}

async function handleSubmitUnfreeze() {
  if (!unfreezeFileUploaded.value) {
    ElMessage.error('请先上传对应的法定解冻官方证明文件！');
    return;
  }

  submitting.value = true;
  try {
    const res = await citizenStore.applyUnfreeze({
      cardNo: citizenStore.currentFamily?.rationCardNo || 'RC-10029381',
      unfreezeType: unfreezeType.value,
      targetMemberId: 'M-004',
      docName: currentDocConfig.value.fileName
    });
    router.push('/review');
  } finally {
    submitting.value = false;
  }
}
</script>
