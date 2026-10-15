import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

def build_excel():
    # 创建工作簿
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "平台功能清单"

    # 数据定义: (系统, 模块, 功能, 描述)
    data = [
        # 一、综合调度导航页（Portal Hub）
        (
            "综合调度导航页（Portal Hub）",
            "导航门户大厅",
            "顶栏多语言中枢",
            "支持阿拉伯语（AR）、库尔德语（KU）、英语（EN）、中文（ZH）四语实时无感切换，全站 RTL/LTR 布局与样式自动适配。"
        ),
        (
            "综合调度导航页（Portal Hub）",
            "导航门户大厅",
            "顶部 Header Banner 品牌展示",
            "中东现代政务建筑全景底图，展示“7×24h 协同保障”金色认证微标、门户主标题与战略保供服务标语。"
        ),
        (
            "综合调度导航页（Portal Hub）",
            "导航门户大厅",
            "公民端服务 APP 直达入口",
            "提供公民端独立卡片，点击在新标签页以 Google Pixel 9 移动 APP 视口打开公民端服务（#/citizen?role=citizen&layout=app），提供在线申领、配给选购、家庭卡、状态查询等服务。"
        ),
        (
            "综合调度导航页（Portal Hub）",
            "导航门户大厅",
            "代理网点现场核销 APP 直达入口",
            "提供代理端独立卡片，点击在新标签页以 Google Pixel 9 移动 APP 视口打开现场核销作业大盘（#/dashboard?role=agent&mode=mobile&layout=app），提供现场扫码核销、物资排程、网点档案等服务。"
        ),
        (
            "综合调度导航页（Portal Hub）",
            "导航门户大厅",
            "国家宏观管理控制台 Web 直达入口",
            "提供管理端独立卡片，点击在新标签页以桌面 Web 视口直达宏观调度中心（#/dashboard?role=minister_center&mode=overview&layout=web），提供部委宏观看板、审核工作台、仓储调拨、投诉监察、后台运维等服务。"
        ),
        (
            "综合调度导航页（Portal Hub）",
            "导航门户大厅",
            "底部协同部委联动展示",
            "常驻展示商业部（MOT）、农业部、卫生部、内政部、财政部等协同部委清单与国家配给服务版权信息。"
        ),

        # 二、统一认证与登录系统（Gateway & Auth）
        (
            "统一认证与登录系统（Gateway & Auth）",
            "用户登录与安全验证",
            "账号密码登录",
            "支持配给卡号（RC-）、手机号、管理员账号与密码登录，提供“记住当前设备”勾选记忆。"
        ),
        (
            "统一认证与登录系统（Gateway & Auth）",
            "用户登录与安全验证",
            "终端硬件安全与授信识别",
            "自动检测当前终端是否为受信任授信设备，动态展示授信/未授信标签，提供“模拟新设备/恢复授信”演示操作。"
        ),
        (
            "统一认证与登录系统（Gateway & Auth）",
            "用户登录与安全验证",
            "新设备二次身份核验弹窗",
            "未授信终端首次登录强制触发：提供“人脸与国民卡核验”（现场自拍比对芯片存根）与“异地成员远程核验”（异地成员手机 GPS 坐标核验）双轨方式。"
        ),
        (
            "统一认证与登录系统（Gateway & Auth）",
            "用户登录与安全验证",
            "生物特征 / NFC 免密认证弹窗",
            "支持统一国民卡 NFC 芯片贴卡免密感应与生物活体人脸识别比对模拟认证。"
        ),
        (
            "统一认证与登录系统（Gateway & Auth）",
            "用户登录与安全验证",
            "纸质配给卡数字化注册向导",
            "面向首次持纸卡公民：OCR 扫描纸质卡存根 -> 智能识别并补充公民基本信息 -> 人脸/远程活体认证 -> 数字化建档并生成电子配给卡。"
        ),
        (
            "统一认证与登录系统（Gateway & Auth）",
            "用户登录与安全验证",
            "快速演示预设身份与模式切换",
            "登录页提供三大预设直达通道：公民角色（B2C APP模式）、代理角色（C2B APP模式）、管理员（Web模式）。"
        ),

        # 三、公民端服务 APP（Citizen Mobile APP - B2C 端）
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "电子配给卡与在册家庭",
            "典雅电子配给卡展示",
            "自适应 Google Pixel 9 移动视口，展示卡激活状态、电子配给卡号、关联纸质配给本编号、法定户主姓名及签约代销网点。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "电子配给卡与在册家庭",
            "防伪动态二维码与条形码详情弹窗",
            "出示电子配给卡高安全动态防伪二维码、条形码及一户一码凭证，用于线下代销网点现场扫描核验。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "电子配给卡与在册家庭",
            "家庭在册成员卡片流",
            "卡片化展示家庭全部成员姓名、亲属关系、国民身份 UID、性别、联系电话、纳保状态（正常/冻结及具体原因）。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "电子配给卡与在册家庭",
            "添加新成员三步向导",
            "步骤1：填写姓名、UID、出生日期、性别；步骤2：内政部身份底册联网核验与出生公函附件上传；步骤3：确认并生成 BPM 审批工单。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "电子配给卡与在册家庭",
            "修改家庭成员信息弹窗",
            "支持补充或更新在册成员现住址、联系电话等扩展资料。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "高频政务业务申报办理",
            "申请代理转移业务办理",
            "展示当前签约代销站，选择目标转移省份、中心与目标代理商，填写迁移理由并提交审批。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "高频政务业务申报办理",
            "申请成员转移业务办理",
            "展示接收卡家庭信息，录入拟迁入成员姓名与身份 UID，上传亲属关系证明材料并报批。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "高频政务业务申报办理",
            "申请分立分户业务办理",
            "展示原卡存根，录入新户家庭地址，勾选剥离成员并指定新户主，上传分户证明文件并提交审核。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "高频政务业务申报办理",
            "变更户主业务办理",
            "展示原户主信息，录入继承公函文号/死亡公证书编号，选择新任法定户主，上传法定继承公函并签署声明提交。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "高频政务业务申报办理",
            "申请解冻申报业务办理",
            "依据第 140 号决议，选择商业、旅行超期、高收入、住址不明、重复等冻结情形，陈述申诉理由并上传证明公文后提交。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "战略配给购买与提货兑付",
            "极简户主与配额胶囊栏",
            "顶部常驻展示户主、卡号、在册人口数、签约网点、当期配给月份与一键刷新。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "战略配给购买与提货兑付",
            "口粮商品选购（步骤1）",
            "展示面粉、大米、食用油、糖四大战略口粮核定配额、官方限价单价、已选重量，支持“一键填满配额”与“一键清空”。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "战略配给购买与提货兑付",
            "履约模式与配送选择（步骤2）",
            "提供“到店自提”（预约提货时段、选择提货人）与“送货上门”（填写配送地址、期望送达时间、代销点派单备注）双模式。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "战略配给购买与提货兑付",
            "订单核算与在线支付（步骤3）",
            "订单汇总核算官方补贴折让与实付规费；支持 QiCard 电子钱包、ZainCash 移动支付、现金提货付；支付完成后生成核销提货码凭证。"
        ),
        (
            "公民端服务 APP（Citizen Mobile APP - B2C 端）",
            "战略配给购买与提货兑付",
            "个人月度份额明细查看",
            "配给管理面板专属视角，查看家庭当期月度战略物资份额明细、国家平价限价保供机制及签约网点在库备货状态。"
        ),

        # 四、代理网点现场核销 APP（Agent Mobile APP - C2B 端）
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "现场核销作业大盘",
            "沉浸式石拱门建筑 Header Banner",
            "展示网点身份徽标与安全认证徽章，显示“今日配给发放”大标题。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "现场核销作业大盘",
            "网点运行状态汇总卡片",
            "展示网点编号（AG-0217#）及运行状态，实时统计今日发放户数、剩余待发户数、待办预警数。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "现场核销作业大盘",
            "全宽砂金扫码主按钮 (CTA)",
            "提供触控弹性动效的全宽核心操作按钮，一键调起现场扫码核销仿真取景框。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "现场核销作业大盘",
            "模拟现场扫码核销仿真弹窗",
            "仿真激光扫描线与取景角标，扫描公民提货二维码/提货码，支持模拟感应扫码、快速通过并自动核减对应在库库存。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "现场核销作业大盘",
            "周期库存台账稽查卡片",
            "四大战略口粮的调拨量、已发量、理论余量、实盘库存量实时四列对比，自动判定“平账”或“损益差异”胶囊。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "现场核销作业大盘",
            "台账平衡公式浮层提示",
            "浮层展示稽查标准公式（理论库存 = 期初调拨 - 实际核销），监控损耗或倒卖异常。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "现场核销作业大盘",
            "保供服务直通车",
            "现场智能核销（扫码弹窗）、物资配给履约（跳转配送）、签约网点档案（跳转网点档案）三联快捷通道。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "现场核销作业大盘",
            "历史分发流水抽屉",
            "支持上滑抽屉，穿透查看今日已领讫家庭明细、卡号、领讫时间、领取物资明细及核销状态。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "现场核销作业大盘",
            "网点与操作员信息抽屉",
            "展示代销网点全称、责任人姓名、管辖行政网格与终端授信状态。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "订单配送与调度管理",
            "订单搜索与类型过滤",
            "支持订单号、卡号、姓名模糊检索，支持筛选全部、送货上门、到店自提。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "订单配送与调度管理",
            "订单状态药丸切换栏",
            "全部、待配货、配送中、已交付、已取消等状态药丸快速横向滑动切换。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "订单配送与调度管理",
            "扫码核验交货快捷入口",
            "顶部常驻高亮【扫码核验交货】大按钮，随时调起核验作业。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "订单配送与调度管理",
            "订单卡片列表与派送调度",
            "展示每笔订单物资清单、重量、家庭地址、联系电话、金额；支持一键派单、指定配送员。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "订单配送与调度管理",
            "订单履约详情弹窗",
            "弹窗穿透查看订单完整物流节点轨迹、提货码验证状态与支付结算记录。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "签约网点档案与资质",
            "签约家庭总览与容量预警",
            "查看网点签约服务的家庭总户数，监控单店 1,500 户上限容量与达标状态。"
        ),
        (
            "代理网点现场核销 APP（Agent Mobile APP - C2B 端）",
            "签约网点档案与资质",
            "资质档案与法定证明",
            "查看网点经营资质代码、有效周期、监管考核评级。"
        ),

        # 五、国家宏观管理控制台 Web（Admin Central Command Console）
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "全国物资配给宏观数据看板",
            "政务大屏 Header Banner",
            "中东政务建筑全景底图，展示国家宏观指挥大盘主副标题与平台运行概况。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "全国物资配给宏观数据看板",
            "公历与伊斯兰历双历控制栏",
            "显示公历与伊斯兰历（Hijri）双历对照指示胶囊，支持全局指标实时手动刷新。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "全国物资配给宏观数据看板",
            "卡片1 - 申请与审核事项指标",
            "滚动展示申请总量、在审待办、待补公文、平均办结用时（天）、超时滞后（>7天）预警数。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "全国物资配给宏观数据看板",
            "卡片2 - 受益公民与家庭指标",
            "滚动展示在保公民总数、纳保登记家庭数、已配给受惠家庭数、当月变动申报增量。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "全国物资配给宏观数据看板",
            "卡片3 - 身份与生物核验指标",
            "滚动展示核验总批次、活体核验通过率、主要重核原因统计、待人工兜底复核数。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "全国物资配给宏观数据看板",
            "卡片4 - 战略物资配给履约指标",
            "滚动展示当期应保家庭、已签收领讫家庭、物资兑付履约率、尚未提货家庭数。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "全国物资配给宏观数据看板",
            "卡片5 - 签约网点保供运行指标",
            "滚动展示在任活跃网点、今日物资发货单、行政网格覆盖（18/18省）、异常履约稽查数。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "全国物资配给宏观数据看板",
            "卡片6 - 中枢底账联网同步指标",
            "滚动展示接口调用成功率、实时底账同频状态、阻断重试队列、待对账差额单据数。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "全国物资配给宏观数据看板",
            "精细业务大盘（Operational）",
            "支持季度、近30天、近7天、近1天多时段切换，查看配给代理保供大盘或全国配给综合数据大盘。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "电子审核工作台（BPM 审批流）",
            "多维待办工单组合筛选",
            "支持关键词检索、省市中心二级联动下拉、提交日期范围过滤、业务来源分类标签快速切换。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "电子审核工作台（BPM 审批流）",
            "待办工单流转列表",
            "表格展示工单号、申请人姓名、省市中心、业务类型、提交时间、审批状态标签（待初审、待终审、已批准、已拒绝）。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "电子审核工作台（BPM 审批流）",
            "申请档案与材料穿透查看",
            "穿透查看户主基本信息、变动家庭成员、申请申诉事由、公函文号、证明文件图片及材料附件。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "电子审核工作台（BPM 审批流）",
            "阶段一：基层分部初审",
            "基层经办人填写初审调查意见，执行“初审推荐通过”或“初审拒绝退回”。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "电子审核工作台（BPM 审批流）",
            "阶段二：主管经理终审",
            "具备法定终审权长官填写终审意见，执行“终审裁决批准”（自动驱动底账生效）或“终审拒绝”。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "电子审核工作台（BPM 审批流）",
            "审批轨迹与审计日志时间轴",
            "时间轴记录各节点审批人、审批时间、具体批注意见的全流程可追溯审计链条。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "群众诉求与投诉监察管理",
            "投诉督办 KPI 指标概览",
            "展示投诉总量、AI 智能客服登记数、1919 热线电话登记数、待分配核查中工单、化解办结率。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "群众诉求与投诉监察管理",
            "多维条件筛选与搜索",
            "渠道来源（AI/热线）、诉求类型（加价/克扣/品质/态度/份额）、办理状态、省市中心、关键词检索。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "群众诉求与投诉监察管理",
            "投诉工单双视图浏览",
            "支持卡片流视图与传统表格视图无缝切换，移动端提供极简折叠与高效浏览。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "群众诉求与投诉监察管理",
            "1919 热线电话投诉登记弹窗",
            "话务员人工录入诉求人姓名、配给卡号、电话、省市中心、被诉网点、诉求分类、投诉陈述。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "群众诉求与投诉监察管理",
            "投诉详情弹窗",
            "展示争议物资、金额、诉求人陈述、现场照片附件证据、督办处理进展时间轴。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "群众诉求与投诉监察管理",
            "监督调查与处置裁决弹窗",
            "录入行政核查结论，下达督办整改措施（限期责令整改、约谈通报、黄牌警告、扣减配额、吊销资质等），录入回复文书。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "国家物资配给与排程调度（SCM 供应链）",
            "月度配给计划制定与调度",
            "查看贸易部国家总配额计划、四大物资月度总吨数、覆盖省份与人口、执行状态。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "国家物资配给与排程调度（SCM 供应链）",
            "制定国家配给计划弹窗",
            "录入计划编号、执行月份批次、起止时间、人均定额标准、调拨物资品种与指导限价。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "国家物资配给与排程调度（SCM 供应链）",
            "三级配额自动分解排程弹窗",
            "上级代理依据贸易部计划一键生成省级 -> 区域 -> 街道三级配额任务，严格按户籍人口公式自动核算，禁止手动篡改。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "国家物资配给与排程调度（SCM 供应链）",
            "国家保供大数据看板（Order Stats）",
            "SCM 订单大数据 Banner，展示今日新生成订单数、各物资累计交付吨数与履约比例。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "国家物资配给与排程调度（SCM 供应链）",
            "AI 供需预测与调拨建议弹窗",
            "基于历年消耗趋势与区域供需缺口，AI 自动生成跨省跨区物资调拨调度建议方案。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "国家物资配给与排程调度（SCM 供应链）",
            "订单多维联动检索与穿透",
            "省市/区域/街道三级联动下拉，状态与履约方式过滤，订单列表明细穿透查看完整物流与支付轨迹。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "网格化代销商全生命周期管理",
            "全国代销网点全网格名录",
            "查看全国签约代销网点名录、编号、店主、签约户数、经营状态（正常、停业、整改、注销）；支持多条件过滤与分页。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "网格化代销商全生命周期管理",
            "申请代理权 (新授予) 向导弹窗",
            "针对空缺网格申报新代销资质：录入代销商信息、选择中心、上传营业执照与场地证明、线上缴纳法定规费。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "网格化代销商全生命周期管理",
            "代理权轮替 (转移) 向导弹窗",
            "代理商变更或轮替申报：选择现任代理与接任代理、陈述变更事由、签署三方协议公函并报批。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "网格化代销商全生命周期管理",
            "恢复已注销代理权向导弹窗",
            "针对整改合格或复议通过的代销点，申请复权恢复其代销资格与系统权限。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "网格化代销商全生命周期管理",
            "注销代理中心确认弹窗",
            "针对违规或主动退出的代销网点，执行注销并解除辖区签约家庭绑定。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "网格化代销商全生命周期管理",
            "业务全景流转与时序约束抽屉",
            "展示 V1~V5 代理全生命周期阶段规则、准入条件、审核委员会组成及审查要点。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "网格化代销商全生命周期管理",
            "代理订单记录（G2B / B2C 流水）",
            "查阅各代销商批量进货订单流水与零售交付凭证。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "网格化代销商全生命周期管理",
            "代理订单统计分析图表",
            "图表化展示各网点周/月核销走势、损耗率与履约排名。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "后台综合治理（Admin Management）",
            "公民配给卡总账管理",
            "支持卡号、户主姓名、省市中心检索；查看户主信息、人口、四大物资月度配额外核指标；支持查看二维码与详情。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "后台综合治理（Admin Management）",
            "在册家庭成员清单穿透模式",
            "一键切换至成员明细视图，查看全国在册成员 UID、关系、性别、状态，穿透到具体家庭。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "后台综合治理（Admin Management）",
            "家庭户籍档案治理",
            "查看家庭档案列表、户籍地址、签约代销点；支持新增家庭、编辑家庭档案信息。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "后台综合治理（Admin Management）",
            "家庭成员冻结与状态管控弹窗",
            "依据第 140 号决议，执行成员状态强管控：冻结（商业、高收入、旅行超期、重复、住址不明等）或解冻。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "后台综合治理（Admin Management）",
            "代销网点档案治理",
            "新增/编辑代销网点档案，分配管辖社区与街道网格，设置最大户数配额。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "后台综合治理（Admin Management）",
            "战略储备粮库调度",
            "维护全国战略粮库档案（名称、库容、省市地址、负责人）；支持新增与编辑粮库档案。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "后台综合治理（Admin Management）",
            "高层专属法定职权执行",
            "行政次长涉案网点强制撤销与辖区家庭二次拆分指派；配给中心部长多网点合并或统一授权核准；规划司总干事新设网点特许审批。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "财政对账与清算结算中心（Reconciliation）",
            "全景对账大屏",
            "批发 -> 零售 -> 财政差额直补资金闭环全息流转图，监控国库总账平衡。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "财政对账与清算结算中心（Reconciliation）",
            "G2B 批发进货结算流水",
            "代销商向上游国营仓储采购付款记录，含结算单号、网点、采购金额、支付状态。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "财政对账与清算结算中心（Reconciliation）",
            "B2C 零售实收规费流水",
            "公民在线或现场平价购粮资金入账流水，含订单号、卡号、支付渠道（QiCard/ZainCash/现金）。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "财政对账与清算结算中心（Reconciliation）",
            "物价差额财政直补台账",
            "官方指导平价与进货差额补贴台账自动核算，展示补贴比例与国库承兑状态。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "财政对账与清算结算中心（Reconciliation）",
            "进销存 100% 账实平衡审计",
            "调拨、发放、理论与实盘盘点稽查，实现 100% 账实相符与零倒卖异常监管。"
        ),
        (
            "国家宏观管理控制台 Web（Admin Central Command Console）",
            "财政对账与清算结算中心（Reconciliation）",
            "省份供需平衡与日终清算对账大盘",
            "全国 18 省供需缺口监控、触发日终清算日结、导出国家财政官方日终清算审计凭单、AI 智能对账分析报告。"
        ),

        # 六、全局协同与基础支撑组件（Common System）
        (
            "全局协同与基础支撑组件（Common System）",
            "全局通用支撑组件",
            "多语言国际化切换组件 (Language Switcher)",
            "页面右上角下拉，支持四国语言（阿拉伯语 AR、库尔德语 KU、英语 EN、中文 ZH）即时切换，文本及布局方向（RTL/LTR）全量实时自适应。"
        ),
        (
            "全局协同与基础支撑组件（Common System）",
            "全局通用支撑组件",
            "全局悬浮 AI 智能政务客服助手",
            "登录后右下角常驻悬浮球（Portal页自动隐藏，APP模式适配手机右下角）：政务知识库多语言问答、常见问题一键发送卡片、转接在线人工客服与 1919 热线直通。"
        ),
        (
            "全局协同与基础支撑组件（Common System）",
            "全局通用支撑组件",
            "跨标签页会话与状态同步 (Cross-Tab Bus)",
            "支持在多标签页同时打开公民端、代理端与管理端时，角色私有 Token 隔离，且家庭成员变动与库存核销数据实时跨端广播同步。"
        )
    ]

    # 写入表头
    headers = ["系统", "模块", "功能", "描述"]
    ws.append(headers)

    # 表头样式设计: 深墨绿色底色 (#1E3F35)，金色细边框与纯白粗体字
    header_font = Font(name="微软雅黑", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1E3F35", end_color="1E3F35", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    thin_border_side = Side(border_style="thin", color="D4D4D4")
    table_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)

    for col_num in range(1, 5):
        cell = ws.cell(row=1, column=col_num)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = table_border

    ws.row_dimensions[1].height = 28

    # 写入数据并格式化
    system_fill_colors = {
        "综合调度导航页（Portal Hub）": "FBF9F5",
        "统一认证与登录系统（Gateway & Auth）": "FFFFFF",
        "公民端服务 APP（Citizen Mobile APP - B2C 端）": "F8FAF8",
        "代理网点现场核销 APP（Agent Mobile APP - C2B 端）": "FDFCF7",
        "国家宏观管理控制台 Web（Admin Central Command Console）": "FFFFFF",
        "全局协同与基础支撑组件（Common System）": "F9FBFB"
    }

    start_row = 2
    for r_idx, row_data in enumerate(data, start=start_row):
        for c_idx, val in enumerate(row_data, start=1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = Font(name="微软雅黑", size=10, color="262626")
            cell.border = table_border
            
            # 对齐方式设置
            if c_idx in (1, 2):
                cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
                cell.font = Font(name="微软雅黑", size=10, bold=True, color="1E3F35")
            elif c_idx == 3:
                cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
                cell.font = Font(name="微软雅黑", size=10, bold=True, color="333333")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
                
            sys_name = row_data[0]
            bg_color = system_fill_colors.get(sys_name, "FFFFFF")
            cell.fill = PatternFill(start_color=bg_color, end_color=bg_color, fill_type="solid")
        
        ws.row_dimensions[r_idx].height = 42

    # 合并 系统列 (第1列) 和 模块列 (第2列)
    total_rows = len(data) + 1

    # 1. 合并系统列
    sys_start = 2
    for r in range(2, total_rows + 1):
        curr_sys = ws.cell(row=r, column=1).value
        next_sys = ws.cell(row=r + 1, column=1).value if r < total_rows else None
        if curr_sys != next_sys:
            if r > sys_start:
                ws.merge_cells(start_row=sys_start, start_column=1, end_row=r, end_column=1)
            sys_start = r + 1

    # 2. 合并模块列 (同系统下的同模块)
    mod_start = 2
    for r in range(2, total_rows + 1):
        curr_sys = ws.cell(row=r, column=1).value
        curr_mod = ws.cell(row=r, column=2).value
        next_sys = ws.cell(row=r + 1, column=1).value if r < total_rows else None
        next_mod = ws.cell(row=r + 1, column=2).value if r < total_rows else None
        
        if curr_mod != next_mod or curr_sys != next_sys:
            if r > mod_start:
                ws.merge_cells(start_row=mod_start, start_column=2, end_row=r, end_column=2)
            mod_start = r + 1

    # 设置合理的列宽
    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["B"].width = 24
    ws.column_dimensions["C"].width = 30
    ws.column_dimensions["D"].width = 68

    # 冻结首行表头
    ws.freeze_panes = "A2"

    # 保存文件
    excel_path = r"d:\RCM\国家物资配给综合调度平台_功能清单.xlsx"
    wb.save(excel_path)
    print(f"Excel 生成成功: {excel_path}")

if __name__ == "__main__":
    build_excel()
