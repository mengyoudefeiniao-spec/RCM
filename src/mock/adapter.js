import { MOCK_USERS } from './data/authData.js';
import { MOCK_FAMILIES } from './data/citizenData.js';
import { MOCK_REVIEW_TICKETS } from './data/reviewData.js';
import { MOCK_STOCKS } from './data/warehouseData.js';
import { MOCK_AGENTS } from './data/agentData.js';
import { MOCK_DASHBOARD_STATS } from './data/dashboardData.js';
import { MOCK_CITIZEN_CARDS, MOCK_FAMILIES_ADMIN, MOCK_AGENTS_ADMIN } from './data/adminData.js';
import { TRANSFER_BRANCH_OPTIONS } from './data/transferData.js';
import { MOCK_TRANSFERABLE_MEMBERS } from './data/memberTransferData.js';

// 本地内存持久化副本，支持前端交互后的数据联动
let familiesStore = JSON.parse(JSON.stringify(MOCK_FAMILIES));
let transferableMembersStore = JSON.parse(JSON.stringify(MOCK_TRANSFERABLE_MEMBERS));
let ticketsStore = JSON.parse(JSON.stringify(MOCK_REVIEW_TICKETS));
let stocksStore = JSON.parse(JSON.stringify(MOCK_STOCKS));
let agentsStore = JSON.parse(JSON.stringify(MOCK_AGENTS));
let adminCardsStore = JSON.parse(JSON.stringify(MOCK_CITIZEN_CARDS));
let adminFamiliesStore = JSON.parse(JSON.stringify(MOCK_FAMILIES_ADMIN));
let adminAgentsStore = JSON.parse(JSON.stringify(MOCK_AGENTS_ADMIN));

/**
 * 包装为企业级统一规范响应体
 * @param {number} code 业务状态码
 * @param {string} message 业务提示
 * @param {any} data 载荷数据
 */
export function createResponse(data = {}, code = 200, message = 'success') {
  return {
    code,
    message,
    data
  };
}

/**
 * Mock 路由分发器
 */
export async function mockDispatch(config) {
  const method = (config.method || 'get').toUpperCase();
  const url = (config.url || '').replace(/^https?:\/\/[^/]+/, ''); // 剥离域名前缀
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
  const params = config.params || {};

  // 模拟真实网络 100~200ms 异步延迟
  await new Promise((resolve) => setTimeout(resolve, 120));

  // ==========================================
  // 1. 认证模块 (Auth)
  // ==========================================
  if (url.includes('/auth/login') && method === 'POST') {
    const { username } = data;
    const user = MOCK_USERS.find(
      (u) => u.username === username || u.role === username || (u.cardNo && u.cardNo === username)
    ) || MOCK_USERS[0];

    return createResponse({
      token: user.token,
      user
    });
  }

  if (url.includes('/auth/profile') && method === 'GET') {
    const user = MOCK_USERS[0];
    return createResponse(user);
  }

  if (url.includes('/auth/logout') && method === 'POST') {
    return createResponse({ success: true }, 200, '登出成功');
  }

  // 1.1 纸质配给卡 OCR 扫描识别与有效性比对校验
  if (url.includes('/auth/ocr-paper-card') && method === 'POST') {
    if (data.mockInvalid) {
      return createResponse({
        paperCardNo: 'IQ-P-1988-001928',
        headName: '萨巴赫·努里',
        province: '巴格达省',
        district: '曼苏尔区',
        memberCount: 0,
        isValid: false,
        validationStatus: '已注销失效',
        validationNotice: '核验未通过：该纸质配给卡存根已于历史系统完成注销注记，存在重卡风险，禁止申领新卡。'
      }, 400, '纸质配给卡已被注销或存根失效，无法升级注册！');
    }

    return createResponse({
      paperCardNo: 'IQ-P-1994-082194',
      headName: data.headName || '艾哈迈德·哈桑·萨利赫',
      province: '巴格达省',
      district: '卡尔赫区 (Al-Karkh)',
      memberCount: 5,
      issueYear: '1994',
      branchCode: 'BAG-KARKH-01',
      confidenceScore: 0.985,
      isValid: true,
      validationStatus: '有效在册',
      validationNotice: '内政部底账存根真实有效，经防重筛查无历史重复建卡记录，准予进入数字化建档。'
    }, 200, '纸质配给卡 OCR 识别完成并通过有效性校验！');
  }

  // 1.2 发送手机短信验证码
  if (url.includes('/auth/send-sms') && method === 'POST') {
    const code = '839201'; // 固化演示验证码便于一键填入
    return createResponse({
      smsCode: code,
      phone: data.phone,
      expireSeconds: 300
    }, 200, `验证码已发送至手机 ${data.phone || ''}，演示验证码：${code}`);
  }

  // 1.3 纸质卡升级换发与公民账号注册
  if (url.includes('/auth/register-citizen') && method === 'POST') {
    const newCardNo = `RC-1002${Math.floor(2000 + Math.random() * 7000)}`;
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      username: newCardNo,
      name: `${data.headName || '新注册持卡人'} (户主)`,
      role: 'citizen',
      department: `${data.province || '巴格达省'}${data.district || '卡尔赫区'}`,
      cardNo: newCardNo,
      token: `jwt-token-citizen-new-${Date.now()}`
    };
    MOCK_USERS.push(newUser);
    return createResponse({
      user: newUser,
      token: newUser.token,
      cardNo: newCardNo
    }, 200, `恭喜！纸质配给卡数字化升级成功，已签发新电子配给卡【${newCardNo}】！`);
  }

  // 1.4 活体人脸识别与统一国民卡双因子核验
  if (url.includes('/auth/verify-biometric') && method === 'POST') {
    return createResponse({
      passed: true,
      similarityScore: '99.4%',
      chipStatus: 'AUTHENTIC',
      matchNotice: '生物活体人脸与统一国民卡 ICAO-9303 防伪芯片匹配通过',
      timestamp: new Date().toISOString()
    }, 200, '生物活体及统一卡双因子对碰成功！');
  }

  // 1.5 异地家庭成员 GPS 与邀请码远程核查
  if (url.includes('/auth/verify-remote') && method === 'POST') {
    const { memberName, location } = data;
    if (location === 'same' || location === '同一住址') {
      return createResponse({
        passed: false,
        message: '核验未通过：定位检测该成员与户主处于同一物理位置，不属于异地居住情形，拒绝授权。'
      }, 400, '非异地成员定位异常');
    }
    if (!memberName || memberName.trim().length < 2) {
      return createResponse({
        passed: false,
        message: '核验未通过：姓名与家庭存根不吻合。'
      }, 400, '姓名核对未通过');
    }
    return createResponse({
      passed: true,
      message: `异地基站与 GPS 核验通过！已确认家庭成员【${memberName}】在【${location || '异地'}】的合法配给授信。`
    }, 200, '异地远程验证通过！');
  }

  // ==========================================
  // 2. 公民与家庭管理模块 (Citizen & Family)
  // ==========================================
  if (url.includes('/citizen/families') && method === 'GET') {
    return createResponse(familiesStore);
  }

  if (url.match(/\/citizen\/family\/([^/]+)/) && method === 'GET') {
    const cardNo = url.split('/').pop();
    const family = familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    return createResponse(family);
  }

  // 申报添加新家庭成员 (POST)
  if (url.match(/\/citizen\/family\/([^/]+)\/members/) && method === 'POST') {
    const cardNo = url.split('/')[3];
    const family = familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    const newMember = {
      id: `M-${Date.now().toString().slice(-4)}`,
      name: data.name,
      nationalId: data.nationalId,
      familyCode: family.familyCode,
      relation: data.relation || '子女',
      birthDate: data.birthDate || '2020-01-01',
      gender: data.gender || '男',
      status: '正常',
      phone: data.phone || '',
      residenceInfo: data.residenceInfo || family.address,
      isUpdatedInSystem: true,
      faceVerified: true
    };
    family.members.push(newMember);
    family.memberCount = family.members.length;
    return createResponse(newMember, 200, `新成员【${newMember.name}】已成功申报登记并纳入电子配给卡！`);
  }

  // 更新成员信息 (PUT)
  if (url.match(/\/citizen\/members\/([^/]+)/) && method === 'PUT') {
    const memberId = url.split('/').pop();
    familiesStore.forEach((f) => {
      const target = f.members.find((m) => m.id === memberId);
      if (target) {
        Object.assign(target, data, { isUpdatedInSystem: true });
      }
    });
    return createResponse({ success: true, memberId }, 200, '家庭成员信息已成功更新');
  }

  // 变更户主 (POST)
  if (url.includes('/citizen/change-head') && method === 'POST') {
    const { cardNo, newHeadId, deathProofNo } = data;
    const ticketId = `REV-DTH-${Date.now().toString().slice(-4)}`;
    
    // 生成电子审核工单流转
    const newTicket = {
      id: ticketId,
      source: '变更户主',
      categoryType: '户主死亡注销与继承任命',
      appType: '变更户主 (死亡医学鉴定核验)',
      cardNo: cardNo || 'RC-10029381',
      applicantName: '继承户主候选人',
      targetMemberName: '原户主 → 新任法定户主',
      reason: `原户主身故注销，依据法医公函【${deathProofNo}】申请指定继任户主。`,
      status: '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: '待决',
      attachments: [{ name: `卫生部法医总局_死亡证明_${deathProofNo}.pdf`, type: 'required', verified: true }],
      payload: { newHeadId, deathProofNo, cardNo }
    };
    ticketsStore.unshift(newTicket);

    return createResponse({ ticketId }, 200, `户主变更申请已提交！已自动转入【审核工作台】(工单号 ${ticketId})`);
  }

  // 申请解冻 (POST)
  if (url.includes('/citizen/apply-unfreeze') && method === 'POST') {
    const { cardNo, unfreezeType, targetMemberId, docName } = data;
    const ticketId = `REV-UNF-${Date.now().toString().slice(-4)}`;

    const newTicket = {
      id: ticketId,
      source: '申请解冻',
      categoryType: `解冻申诉 (${unfreezeType}情形)`,
      appType: `解冻申请 (${unfreezeType}情形)`,
      cardNo: cardNo || 'RC-10029381',
      applicantName: '配给卡持有人',
      targetMemberName: '解冻当事人',
      reason: `依据【${unfreezeType}】情形提交证明材料【${docName}】，申请恢复配给。`,
      status: '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: '待决',
      attachments: [{ name: docName, type: 'required', verified: true }],
      payload: { unfreezeType, targetMemberId, docName }
    };
    ticketsStore.unshift(newTicket);

    return createResponse({ ticketId }, 200, `解冻申请已受理！已转入【审核工作台】(工单号 ${ticketId})`);
  }

  // 申请分户：优先系统智能自动判别 (POST)
  if (url.includes('/citizen/split-household/auto-judge') && method === 'POST') {
    const { memberIds, currentCardNo } = data;
    const family = familiesStore.find((f) => f.rationCardNo === currentCardNo) || familiesStore[0];
    const selectedMembers = (family?.members || []).filter((m) => memberIds.includes(m.id));

    const hasMale = selectedMembers.some((m) => m.gender === '男');
    const hasFemale = selectedMembers.some((m) => m.gender === '女');
    const isCouple = selectedMembers.length >= 2 && hasMale && hasFemale;

    if (isCouple) {
      // 判别通过：自动执行分户并签发新卡
      const newCardNo = `RC-1002${Math.floor(2000 + Math.random() * 7000)}`;
      const newFamilyCode = `FAM-BAG-${Math.floor(10000 + Math.random() * 89999)}`;
      const headCandidate = selectedMembers.find((m) => m.gender === '男') || selectedMembers[0];

      const splitFamily = {
        rationCardNo: newCardNo,
        oldPaperCardNo: 'NEW-SPLIT-AUTO',
        familyCode: newFamilyCode,
        province: family.province,
        district: family.district,
        headName: headCandidate.name,
        phone: headCandidate.phone || family.phone,
        memberCount: selectedMembers.length,
        status: '正常',
        agentId: family.agentId,
        agentName: family.agentName,
        address: headCandidate.residenceInfo || family.address,
        createdDate: new Date().toISOString().split('T')[0],
        lastSelfCheckDate: new Date().toISOString().split('T')[0],
        members: selectedMembers.map((m) => ({
          ...m,
          familyCode: newFamilyCode,
          relation: m.id === headCandidate.id ? '户主' : m.gender === '女' ? '配偶' : '子女',
          isUpdatedInSystem: true
        }))
      };

      // 从原家庭剔除分立成员
      family.members = family.members.filter((m) => !memberIds.includes(m.id));
      family.memberCount = family.members.length;
      familiesStore.unshift(splitFamily);

      return createResponse({
        passed: true,
        newCardNo,
        message: `【系统自动判别通过】识别为标准合法夫妻，已自动批准分户并签发新配给卡号：${newCardNo}！`
      });
    } else {
      // 判别未通过
      const reason = selectedMembers.length === 1
        ? '拟分立成员仅为单独一人，不满足“夫妻标准组合”自动识别规则，系统自动判别未通过。'
        : '拟分立成员组合非标准夫妻结构，系统自动判别未通过。';
      return createResponse({
        passed: false,
        reason,
        message: reason
      });
    }
  }

  // 申请分户：提交分部电子审核 (POST)
  if (url.includes('/citizen/split-household/submit-review') && method === 'POST') {
    const { currentCardNo, memberIds, reason } = data;
    const ticketId = `REV-SPL-${Date.now().toString().slice(-4)}`;

    const newTicket = {
      id: ticketId,
      source: '申请分户',
      categoryType: memberIds.length === 1 ? '单人分户人工审核' : '非夫妻组合分户审核',
      appType: `配给卡分户 (${memberIds.length === 1 ? '单人分立' : '非夫妻组合'})`,
      cardNo: currentCardNo || 'RC-10029381',
      applicantName: '原家庭户主/申请人',
      targetMemberName: `分立人员(${memberIds.length}人)`,
      reason: reason || '系统自动判别未通过，转交分部门人员手动审核',
      status: '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: '待决',
      attachments: [
        { name: '民事结婚证书或等效分户司法文件.pdf', type: 'required', verified: true }
      ],
      payload: { splitMemberIds: memberIds }
    };
    ticketsStore.unshift(newTicket);

    return createResponse({ ticketId }, 200, `已成功提交电子审核！工单号【${ticketId}】，等待分部门人员手动审核`);
  }

  // 代理转移候选分部、中心及代理元数据 (GET)
  if (url.includes('/citizen/transfer-agent/options') && method === 'GET') {
    return createResponse(TRANSFER_BRANCH_OPTIONS);
  }

  // 提交配给卡代理转移申请 (POST)
  if (url.includes('/citizen/transfer-agent/submit') && method === 'POST') {
    const {
      cardNo,
      fromProvince,
      toProvince,
      toBranch,
      toCenter,
      toFlourAgent,
      toFoodAgent,
      district,
      subDistrict,
      nearestLandmark,
      residenceProofDoc,
      article140Doc
    } = data;

    // 1. 容量红线检查 (1,500户上限)
    if (toFlourAgent?.currentHouseholds >= 1500) {
      return createResponse({}, 400, `所选面粉代理【${toFlourAgent.name}】已达 1,500 户服务上限，禁止转入，请选择其他网点！`);
    }
    if (toFoodAgent?.currentHouseholds >= 1500) {
      return createResponse({}, 400, `所选食品代理【${toFoodAgent.name}】已达 1,500 户服务上限，禁止转入，请选择其他网点！`);
    }

    const family = familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    const isIntraProvince = fromProvince && toProvince && (fromProvince.split(' ')[0] === toProvince.split(' ')[0]);

    if (isIntraProvince) {
      // 路径 A: 省内转移 (全自动批准)
      family.province = toProvince;
      family.district = `${toBranch} · ${toCenter?.centerName || ''}`;
      family.agentId = `${toFlourAgent?.id || 'FA'} / ${toFoodAgent?.id || 'FD'}`;
      family.agentName = `${toFlourAgent?.name || ''} ＆ ${toFoodAgent?.name || ''}`;
      family.address = `${toProvince} ${district || ''} ${subDistrict || ''} (地标: ${nearestLandmark || '就近街区'})`;

      return createResponse({
        autoApproved: true,
        passed: true,
        message: `【省内转移自动核准通过】已自动将配给卡转移至【${toFlourAgent?.name}】与【${toFoodAgent?.name}】，配给卡代理及供货点已即时更新生效！`
      }, 200, '省内转移全自动批准生效！');
    } else {
      // 路径 B: 跨省转移 (流转至转入分部两级电子审核工作台)
      const ticketId = `REV-TRF-${Date.now().toString().slice(-4)}`;
      const newTicket = {
        id: ticketId,
        source: '代理转移',
        categoryType: '跨省代理转移两级审批',
        appType: `跨省代理转移 (${fromProvince} → ${toProvince})`,
        cardNo: cardNo || family.rationCardNo,
        applicantName: family.headName,
        targetMemberName: `${family.headName} (全户 ${family.memberCount} 人)`,
        reason: `因工作/家庭迁居由【${fromProvince}】跨省迁往【${toProvince} · ${toBranch} · ${toCenter?.centerName}】，申请就近转移面粉代理【${toFlourAgent?.name}】与食品代理【${toFoodAgent?.name}】。`,
        status: '待分部初审',
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        staffOpinion: '',
        managerDecision: '待决',
        attachments: [
          { name: residenceProofDoc || '新迁入地居住证及确认证明公函.pdf', type: 'required', verified: true },
          ...(article140Doc ? [{ name: article140Doc, type: 'required', verified: true }] : [])
        ],
        payload: {
          type: 'transferAgent',
          cardNo: cardNo || family.rationCardNo,
          toProvince,
          toBranch,
          toCenterName: toCenter?.centerName,
          toFlourAgent,
          toFoodAgent,
          newAddress: `${toProvince} ${district || ''} ${subDistrict || ''} (地标: ${nearestLandmark || '就近街区'})`
        }
      };
      ticketsStore.unshift(newTicket);

      return createResponse({
        autoApproved: false,
        passed: true,
        ticketId,
        message: `跨省代理转移申请已提交！已流转至【${toProvince}】转入分部审核工作台，工单编号：${ticketId}。`
      }, 200, `跨省转移申报已转入分部审核工作台 (工单号 ${ticketId})`);
    }
  }

  // ==========================================
  // 2.2 成员转移业务 (Member Transfer)
  // ==========================================
  // 成员转移候选池 (GET)
  if (url.includes('/citizen/member-transfer/candidates') && method === 'GET') {
    return createResponse(transferableMembersStore);
  }

  // 根据国民编号查询待转移成员档案与状态 (GET)
  // 支持 mode = 'demo' (演示自适应模拟) 或 'real' (严格真实验证)
  if (url.includes('/citizen/member-transfer/query') && method === 'GET') {
    const cleanUrl = url.split('?')[0];
    const nationalId = cleanUrl.replace(/\/+$/, '').split('/').pop().trim();
    const isRealMode = url.includes('mode=real');

    let found = transferableMembersStore.find((m) => m.nationalId === nationalId);
    if (!found) {
      if (isRealMode) {
        return createResponse({}, 404, `【真实验证模式拦截】：国家内政部公民数据库未查找到国民编号为【${nationalId}】的在册公民档案，请核对有效编号后重试。`);
      }

      // 演示模拟模式：根据任意输入的国民编号动态创建高仿真成员档案，确保演示流程畅通无阻
      const currentFamily = familiesStore[0] || { familyCode: 'FAM-BAG-08832', headName: '艾哈迈德·哈桑·萨利赫' };
      const demoMember = {
        nationalId: nationalId,
        name: `萨尔曼·拉希德 (演示模拟_${nationalId.slice(-4) || '01'})`,
        relationType: 'wife',
        relationLabel: '妻子 (演示自适应)',
        gender: '女',
        birthDate: '1992-06-15',
        fatherName: '拉希德·哈米德', // 默认不同父
        familyCode: currentFamily.familyCode, // 默认同家庭编号
        currentCardNo: `RC-${Date.now().toString().slice(-8)}`,
        currentProvince: '巴格达省 (Baghdad)',
        currentCenterName: '鲁萨法第一配给中心 (#01)',
        isArticle140Area: false,
        isUpdatedInSystem: true,
        faceVerified: true,
        suggestedReason: '演示模式自适应模拟成员，支持全流程贯通与场景切换测试',
        proofDocName: '最高司法委员会民事结婚登记证书_DEMO.pdf',
        isDemoGenerated: true
      };
      transferableMembersStore.push(demoMember);
      found = demoMember;
    }
    return createResponse(found);
  }

  // 提交成员转移申请 (POST)
  if (url.includes('/citizen/member-transfer/submit') && method === 'POST') {
    const {
      targetCardNo,
      member,
      transferType, // 'wife' | 'child' | 'guardianship' | 'support' | 'other'
      article140Doc,
      reasonDoc,
      paymentInfo
    } = data;

    // 核心前置拦截：未在系统中更新的成员从一开始就禁止选择和转移
    if (!member || member.isUpdatedInSystem === false) {
      return createResponse({}, 400, '【前置条件未满足】：该成员未在配给卡系统中完成登记更新，国家法令严禁办理转移业务！');
    }

    const currentFamily = familiesStore.find((f) => f.rationCardNo === targetCardNo) || familiesStore[0];
    const isArticle140 = !!(member.isArticle140Area || currentFamily.province.includes('基尔库克') || currentFamily.province.includes('迪亚拉') || currentFamily.province.includes('尼尼微'));

    let autoApproved = false;
    let reasonText = '';

    // 5. 按成员类型划分的自动批准条件
    if (transferType === 'wife') {
      // 5.1 妻子转移：同家庭编号 且 双方父亲姓名不同
      // 夫家父亲名 (艾哈迈德的父亲为哈桑·萨利赫)
      const isIdentified = (member.familyCode === currentFamily.familyCode) && (member.fatherName !== '哈桑·萨利赫');
      if (isIdentified) {
        autoApproved = true;
        reasonText = '【妻子自动识别通过】：妻子与新卡户主同属已登记家庭档案，且双方父亲姓名不同（排除近亲），系统自动核准通过。';
      } else {
        autoApproved = false;
        reasonText = '系统未能自动匹配妻子关联信息（家庭档案未同步或近亲识别异常），申请转交配给分部两级电子审核。';
      }
    } else if (transferType === 'child') {
      // 5.2 子女转移
      if (isArticle140) {
        // 在第140号决议地区以内：子女转移始终须经配给分部员工电子审核，并上传第140号决议无异议文件
        autoApproved = false;
        reasonText = '涉及第140号决议争议覆盖区域，依据国家法规，子女转移必须转交转入分部两级人工电子审核并备案无异议公函。';
      } else {
        // 在第140号决议地区以外：同时满足 1.家庭编号一致 2.父亲名字与新卡户主一致
        const famCodeMatch = member.familyCode === currentFamily.familyCode;
        const fatherNameMatch = member.fatherName === currentFamily.headName;
        if (famCodeMatch && fatherNameMatch) {
          autoApproved = true;
          reasonText = '【子女自动识别通过】：子女与新卡家庭编号一致且生父姓名与新卡户主一致，系统自动批准转移。';
        } else {
          autoApproved = false;
          reasonText = '子女亲属比对信息未完全吻合，申请转交配给分部员工进行电子审核。';
        }
      }
    } else {
      // 5.3 其他情况（监护、抚养或其他原因）：始终须经配给分部员工电子审核
      autoApproved = false;
      reasonText = `转移事由属于【${transferType === 'guardianship' ? '法定监护' : transferType === 'support' ? '亲属抚养' : '特殊法定原因'}】，依法须经配给分部两级人工审查法定证明公文。`;
    }

    if (autoApproved) {
      // 路径 1: 自动批准：将成员正式移入当前家庭
      const newMember = {
        id: `M-TRF-${Date.now().toString().slice(-4)}`,
        name: member.name,
        nationalId: member.nationalId,
        familyCode: currentFamily.familyCode,
        relation: transferType === 'wife' ? '配偶' : '子女',
        birthDate: member.birthDate || '1995-01-01',
        gender: member.gender || '女',
        status: '正常',
        phone: member.phone || currentFamily.phone,
        residenceInfo: currentFamily.address,
        isUpdatedInSystem: true,
        faceVerified: true
      };

      currentFamily.members.push(newMember);
      currentFamily.memberCount = currentFamily.members.length;

      // 从候选池移除
      transferableMembersStore = transferableMembersStore.filter((m) => m.nationalId !== member.nationalId);

      return createResponse({
        autoApproved: true,
        passed: true,
        member: newMember,
        message: `【成员转移全自动批准生效】${reasonText}，新成员【${member.name}】已成功移入您的电子配给卡！`
      }, 200, '成员转移已自动批准并即刻生效！');
    } else {
      // 路径 2: 电子审核：转入配给分部工作台 (分部初审 -> 经理终审)
      const ticketId = `REV-MEM-${Date.now().toString().slice(-4)}`;
      const newTicket = {
        id: ticketId,
        source: '成员转移',
        categoryType: transferType === 'wife' ? '妻子转移人工核验' : transferType === 'child' ? '子女跨卡转移审核' : '法定监护/抚养跨卡转移',
        appType: `跨卡成员转移 (${member.name})`,
        cardNo: targetCardNo || currentFamily.rationCardNo,
        applicantName: currentFamily.headName,
        targetMemberName: `${member.name} (国民号: ${member.nationalId})`,
        reason: `${reasonText} 原持卡所属【${member.currentProvince} · ${member.currentCenterName}】`,
        status: '待分部初审',
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        staffOpinion: '',
        managerDecision: '待决',
        attachments: [
          { name: reasonDoc || '亲属法律关系证明公函.pdf', type: 'required', verified: true },
          ...(article140Doc ? [{ name: article140Doc, type: 'required', verified: true }] : [])
        ],
        payload: {
          type: 'memberTransfer',
          targetCardNo,
          member,
          transferType
        }
      };
      ticketsStore.unshift(newTicket);

      return createResponse({
        autoApproved: false,
        passed: true,
        ticketId,
        message: `成员转移申请已受理！工单号【${ticketId}】，已转入接收分部审核工作台，请等待分部专员与经理两级终审签批。`
      }, 200, `已成功转入分部电子审核工作台 (工单号 ${ticketId})`);
    }
  }

  // ==========================================
  // 3. 审核工作台模块 (Electronic Review)
  // ==========================================
  if (url.includes('/review/tickets') && method === 'GET') {
    const source = params.source;
    if (!source || source === '全部') {
      return createResponse(ticketsStore);
    }
    const filtered = ticketsStore.filter((t) => t.source === source);
    return createResponse(filtered);
  }

  // 提交第一级员工审核意见 (POST)
  if (url.includes('/review/staff-opinion') && method === 'POST') {
    const { ticketId, staffOpinion, staffName } = data;
    const ticket = ticketsStore.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = '待经理终审';
      ticket.staffOpinion = staffOpinion;
      ticket.staffName = staffName || '萨米拉·卡西姆 (资格审核专员)';
      ticket.staffReviewedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    }
    return createResponse(ticket, 200, '初审意见已提交，工单已流转至经理终审阶段');
  }

  // 提交第二级经理终审裁决 (POST)
  if (url.includes('/review/manager-decision') && method === 'POST') {
    const { ticketId, decision, notes, managerName } = data;
    const ticket = ticketsStore.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = decision === '接受' ? '已批准' : '已驳回';
      ticket.managerDecision = decision;
      ticket.managerNotes = notes;
      ticket.managerName = managerName || '海德尔·阿卜杜拉 (分部经理)';
      ticket.managerDecidedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

      // 若终审接受，自动落地对应业务实体变更
      if (decision === '接受' && ticket.payload) {
        if (ticket.payload.type === 'transferAgent') {
          // 跨省代理转移终审落地
          const targetFam = familiesStore.find((f) => f.rationCardNo === ticket.payload.cardNo);
          if (targetFam) {
            targetFam.province = ticket.payload.toProvince;
            targetFam.district = `${ticket.payload.toBranch} · ${ticket.payload.toCenterName}`;
            targetFam.agentId = `${ticket.payload.toFlourAgent?.id || 'FA'} / ${ticket.payload.toFoodAgent?.id || 'FD'}`;
            targetFam.agentName = `${ticket.payload.toFlourAgent?.name || ''} ＆ ${ticket.payload.toFoodAgent?.name || ''}`;
            targetFam.address = ticket.payload.newAddress;
          }
        } else if (ticket.payload.newHeadId) {
          const family = familiesStore.find((f) => f.rationCardNo === ticket.cardNo);
          if (family) {
            const newHead = family.members.find((m) => m.id === ticket.payload.newHeadId);
            if (newHead) {
              family.members.forEach((m) => {
                if (m.relation === '户主') m.status = '已故';
                if (m.id === ticket.payload.newHeadId) m.relation = '户主';
              });
              family.headName = newHead.name;
            }
          }
        } else if (ticket.payload.unfreezeType && ticket.payload.targetMemberId) {
          familiesStore.forEach((f) => {
            const m = f.members.find((item) => item.id === ticket.payload.targetMemberId);
            if (m) {
              m.status = '正常';
              m.freezeReason = '';
            }
          });
        } else if (ticket.payload.type === 'memberTransfer' && ticket.payload.member) {
          // 成员转移终审落地
          const targetFam = familiesStore.find((f) => f.rationCardNo === ticket.payload.targetCardNo) || familiesStore[0];
          if (targetFam) {
            const mem = ticket.payload.member;
            targetFam.members.push({
              id: `M-TRF-${Date.now().toString().slice(-4)}`,
              name: mem.name,
              nationalId: mem.nationalId,
              familyCode: targetFam.familyCode,
              relation: ticket.payload.transferType === 'wife' ? '配偶' : ticket.payload.transferType === 'child' ? '子女' : '被监护亲属',
              birthDate: mem.birthDate || '2000-01-01',
              gender: mem.gender || '女',
              status: '正常',
              phone: mem.phone || targetFam.phone,
              residenceInfo: targetFam.address,
              isUpdatedInSystem: true,
              faceVerified: true
            });
            targetFam.memberCount = targetFam.members.length;
          }
        }
      }
    }
    return createResponse(ticket, 200, `终审已裁决为【${decision}】！`);
  }

  // ==========================================
  // 4. 仓储供应链模块 (Warehouse)
  // ==========================================
  if (url.includes('/warehouse/stocks') && method === 'GET') {
    return createResponse(stocksStore);
  }

  // ==========================================
  // 5. 代理商模块 (Agent)
  // ==========================================
  if (url.includes('/agent/list') && method === 'GET') {
    return createResponse(agentsStore);
  }

  // ==========================================
  // 6. 大屏看板统计 (Dashboard)
  // ==========================================
  if (url.includes('/dashboard/overview') && method === 'GET') {
    return createResponse(MOCK_DASHBOARD_STATS);
  }

  // ==========================================
  // 7. 监督官后台管理模块 (Admin Management)
  // ==========================================
  // 7.1 公民配给卡列表
  if (url.includes('/admin/citizen-cards') && method === 'GET') {
    let result = [...adminCardsStore];
    if (params.cardNo) {
      result = result.filter((c) => c.cardNo.toLowerCase().includes(params.cardNo.toLowerCase()));
    }
    if (params.headName) {
      result = result.filter((c) => c.headName.includes(params.headName));
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((c) => c.status === params.status);
    }
    if (params.province && params.province !== '全部') {
      result = result.filter((c) => c.province.includes(params.province));
    }
    return createResponse(result);
  }

  // 7.2 修改配给卡状态（解冻 / 冻结 / 吊销）
  if (url.match(/\/admin\/citizen-cards\/([^/]+)\/status/) && method === 'PUT') {
    const cardId = url.split('/')[3];
    const target = adminCardsStore.find((c) => c.id === cardId || c.cardNo === cardId);
    if (target) {
      target.status = data.status;
      target.freezeReason = data.reason || '';
      return createResponse(target, 200, `配给卡【${target.cardNo}】状态已变更为【${data.status}】`);
    }
    return createResponse({}, 404, '未找到指定配给卡记录');
  }

  // 7.3 调整月度配额
  if (url.match(/\/admin\/citizen-cards\/([^/]+)\/quota/) && method === 'PUT') {
    const cardId = url.split('/')[3];
    const target = adminCardsStore.find((c) => c.id === cardId || c.cardNo === cardId);
    if (target) {
      target.quotas = { ...target.quotas, ...data.quotas };
      return createResponse(target, 200, `配给卡【${target.cardNo}】月度定额已更新成功`);
    }
    return createResponse({}, 404, '未找到指定配给卡记录');
  }

  // 7.4 换发新卡 / 重置 NFC
  if (url.match(/\/admin\/citizen-cards\/([^/]+)\/reissue/) && method === 'POST') {
    const cardId = url.split('/')[3];
    const target = adminCardsStore.find((c) => c.id === cardId || c.cardNo === cardId);
    if (target) {
      target.rfidChipUid = `NFC-IQ-${Math.floor(1000000 + Math.random() * 8999999)}X`;
      target.lastVerifiedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      return createResponse(target, 200, `配给卡【${target.cardNo}】已完成芯片重置并换发新卡`);
    }
    return createResponse({}, 404, '未找到指定配给卡记录');
  }

  // 7.5 家庭户籍档案列表
  if (url.includes('/admin/families') && method === 'GET') {
    let result = [...adminFamiliesStore];
    if (params.familyCode) {
      result = result.filter((f) => f.familyCode.toLowerCase().includes(params.familyCode.toLowerCase()));
    }
    if (params.headName) {
      result = result.filter((f) => f.headName.includes(params.headName));
    }
    if (params.category && params.category !== '全部') {
      result = result.filter((f) => f.category === params.category);
    }
    return createResponse(result);
  }

  // 7.6 新增家庭户籍档案
  if (url.includes('/admin/families') && method === 'POST') {
    const newFamily = {
      id: `FAM-BAG-${Date.now().toString().slice(-4)}`,
      familyCode: `FAM-BAG-${Math.floor(10000 + Math.random() * 89999)}`,
      cardNo: data.cardNo || `RC-1002${Math.floor(2000 + Math.random() * 7000)}`,
      headName: data.headName,
      headNationalId: data.headNationalId,
      category: data.category || '普通保障家庭',
      memberCount: data.memberCount || 1,
      address: data.address || '',
      registeredDate: new Date().toISOString().split('T')[0],
      adminBranch: data.adminBranch || '卡尔赫第一粮食供应分部',
      phone: data.phone || '',
      members: data.members || []
    };
    adminFamiliesStore.unshift(newFamily);
    return createResponse(newFamily, 200, `家庭户籍档案【${newFamily.familyCode}】登记成功！`);
  }

  // 7.7 编辑家庭档案
  if (url.match(/\/admin\/families\/([^/]+)/) && method === 'PUT') {
    const familyId = url.split('/').pop();
    const target = adminFamiliesStore.find((f) => f.id === familyId || f.familyCode === familyId);
    if (target) {
      Object.assign(target, data);
      return createResponse(target, 200, `家庭档案【${target.familyCode}】已更新！`);
    }
    return createResponse({}, 404, '未找到指定家庭档案');
  }

  // 7.8 删除家庭档案
  if (url.match(/\/admin\/families\/([^/]+)/) && method === 'DELETE') {
    const familyId = url.split('/').pop();
    adminFamiliesStore = adminFamiliesStore.filter((f) => f.id !== familyId && f.familyCode !== familyId);
    return createResponse({ success: true }, 200, '家庭户籍档案已注销注销成功');
  }

  // 7.9 代理网点管理列表
  if (url.includes('/admin/agents') && method === 'GET') {
    let result = [...adminAgentsStore];
    if (params.code) {
      result = result.filter((a) => a.code.toLowerCase().includes(params.code.toLowerCase()));
    }
    if (params.name) {
      result = result.filter((a) => a.name.includes(params.name));
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((a) => a.status === params.status);
    }
    return createResponse(result);
  }

  // 7.10 修改代理网点状态
  if (url.match(/\/admin\/agents\/([^/]+)\/status/) && method === 'PUT') {
    const agentId = url.split('/')[3];
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      target.status = data.status;
      return createResponse(target, 200, `代理网点【${target.name}】状态已切换为【${data.status}】`);
    }
    return createResponse({}, 404, '未找到指定代理网点');
  }

  // 7.11 新增代理网点
  if (url.includes('/admin/agents') && method === 'POST') {
    const newAgent = {
      id: `AGT-${Date.now().toString().slice(-4)}`,
      code: `FA-${Math.floor(10000 + Math.random() * 89999)}`,
      name: data.name,
      manager: data.manager,
      phone: data.phone,
      province: data.province || '巴格达省',
      district: data.district || '',
      address: data.address || '',
      status: '正常营业',
      rating: 5,
      servedHouseholds: data.servedHouseholds || 500,
      storageCapacity: data.storageCapacity || 50,
      lastInspectedAt: new Date().toISOString().split('T')[0]
    };
    adminAgentsStore.unshift(newAgent);
    return createResponse(newAgent, 200, `代理网点【${newAgent.name}】入网登记成功！`);
  }

  // 7.12 更新代理网点资料
  if (url.match(/\/admin\/agents\/([^/]+)/) && method === 'PUT') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      Object.assign(target, data);
      return createResponse(target, 200, `代理网点资料已更新成功`);
    }
    return createResponse({}, 404, '未找到指定代理网点');
  }

  // 默认兜底响应
  return createResponse({}, 200, 'Mock Default Response');
}
