# PocketBase 业务数据同步设置

前端使用当前演示 API，PocketBase 作为共享业务数据存储。启动时先从 PocketBase 读取共享数据；若集合中还没有记录，首次运行的设备会把已有业务缓存写入 PocketBase。后续业务缓存写入会同步到 PocketBase，已打开的客户端每 15 秒读取一次更新。

## APP 客服投诉与办理通知

公民 APP 和代理 APP 的智能客服底部提供投诉入口及投诉进度查询。新投诉按 `rcm_shared_complaint_<工单号>` 单独保存到 `app_data`，包含提交账号、角色、联系信息、诉求及办理历史；工单使用与界面语言无关的状态和类型代码。管理 Web 的“投诉和处理”读取相同工单，办理意见和状态更新会同步回 APP。不同设备需连接同一个 PocketBase 实例，已打开的页面通常在下一次同步周期内看到更新。

客服会保存用户输入的原文（包括标点、换行和空格），切换界面语言、恢复历史或转接人工时不会用预设问句覆盖原文。当前演示通过中、英、阿拉伯语和库尔德语规则识别投诉、投诉进度及明确转人工意图，并区分负面情绪、否定和条件式咨询；单独提及代理 `agent` 不再触发人工转接。识别到投诉后先显示本地化安抚回复，再打开预填原文和诉求分类的投诉草稿，需用户补充信息并确认提交才会立案。提交后记录 `sourceMessageId` 及根据提交内容重新计算的 `intakeAnalysis`，供关联和跟进使用。规则识别不等同于通用语言模型的完整语义分析。

APP 的投诉列表和办结通知按提交账号及角色匹配。办结后生成带工单号的通知，点击可打开客服中的对应办理进度；已读状态保存在账号对应的 `rcm_my_*_complaint_reads_*_v1` 记录中。运行中的 APP 会显示应用内提醒；授予设备通知权限后，使用现有浏览器/Service Worker 通知机制显示提醒。APP 完全关闭时的离线推送仍需部署端的 Web Push 服务发送推送，前端同步轮询不会在关闭后继续运行。

投诉内容支持语音转文字，识别语言可选择，识别结果可编辑后提交。浏览器使用 Web Speech API，Android 安装包通过限定应用本地来源的原生桥调用系统语音识别服务。Android 会在用户使用语音功能时申请麦克风权限，在开启消息提醒时申请通知权限；原生通知点击后打开对应投诉。此原生支持需要重新构建、安装 APK。识别语言及联网支持取决于浏览器或手机已安装的识别服务；不支持、拒绝麦克风权限或识别失败时可继续使用文字输入。

## 创建集合

在 PocketBase 管理后台创建一个 **Base collection**：

- 集合名：`app_data`（也可改名，但需同步修改 `VITE_POCKETBASE_COLLECTION`）
- `key`：Text，Required，唯一索引
- `value`：JSON，Required
- `created`、`updated`：使用 PocketBase 自动生成字段

建议为 `key` 加唯一索引：`CREATE UNIQUE INDEX idx_app_data_key ON app_data (key)`。

再创建一个 **Base collection** 用于附件：

- 集合名：`app_files`（可由 `VITE_POCKETBASE_FILES_COLLECTION` 配置）
- `key`：Text，Required，唯一索引
- `file`：File，Required，单文件
- `created`、`updated`：PocketBase 自动生成字段

`app_data` 存放 `rcm_shared_*`、`rcm_center_*`、`rcm_my_*` 以及 `rcm_registration_*` 业务记录；密码摘要、短信验证信息、人脸验证凭据、登录令牌和设备偏好不会同步。家庭、申请、订单和注册档案以 JSON 值保存。聊天附件及补充材料放入 `app_files` 的 PocketBase 文件字段；注册档案的图像仍以 Data URL 包含在 JSON 中。

`app_data.value` 可以保持 Required。PocketBase 会把空数组 `[]` 当作空值拒绝写入，因此 App 与重置脚本会将空数组编码为 `{"__rcm_pocketbase_empty_array_v1__":true}` 保存，并在 App 读取时还原成 `[]`。不要在 App 中直接消费 PocketBase 返回的原始 `value`，请通过应用同步层读取。

## API 规则与访问安全

客户端需要对 `app_data` 和 `app_files` 集合执行 list/view/create/update/delete。PocketBase 的 API Rules 必须允许已登录的应用用户完成这些操作。当前演示登录仍由前端 Mock 实现，因此不要为了让演示连通而在含真实个人信息的实例上开放匿名写入；正式部署应先接入 PocketBase 用户认证，或通过受信任的服务端 API 执行业务读写，再设置按用户/角色限制的规则。浏览器端不能安全保存 PocketBase superuser 凭据。

还需在 PocketBase 部署端允许该前端站点的跨域请求（CORS）。

## 前端配置

复制 `.env.example` 为 `.env`，设置：

```dotenv
VITE_POCKETBASE_SYNC=true
VITE_POCKETBASE_URL="https://pb.51xyu.com"
VITE_POCKETBASE_COLLECTION="app_data"
VITE_POCKETBASE_FILES_COLLECTION="app_files"
```

Vite 环境变量在构建时写入前端包；修改后需重新构建/打包，并让两个 App 使用相同的 PocketBase 地址和集合名。连接失败时页面仍会启动并保留本机缓存，错误会记录在浏览器控制台。

## 更新省份初始化数据

运行 `npm run deploy:pocketbase:provinces`，只创建或更新 `rcm_shared_message_recipient_tree`。该操作会补齐伊拉克 19 个省份，并合并保留现有代理/配给网点层级及自定义数据；不会清空家庭、订单或业务规则。脚本会提示输入 PocketBase 超级用户凭据。

## 一键重置演示数据

运行仓库根目录的 `scripts/reset-pocketbase.ps1`，或 `npm run reset:pocketbase`。脚本提示输入超级用户邮箱和密码，并要求输入 `RESET` 确认。默认连接 `https://pb.51xyu.com` 的 `app_data` 集合；也可传入自定义地址和集合：

```powershell
.\scripts\reset-pocketbase.ps1 -PocketBaseUrl "https://pb.example.com" -Collection "app_data"
```

脚本不删除其他 `app_data` 数据：所有语言的家庭数据恢复为项目初始数据并只保留前 4 名成员；公民配给订单数组设为空；创建或更新 `rcm_shared_message_recipient_tree`，初始化伊拉克 19 个省份并保留现有代理/配给网点层级；同时创建或更新 `rcm_center_business_rules_v1`，为 140 号决议地区清单写入中心名称和所属省份的多语言数据。已有业务规则及中心清单会保留，仅补齐缺失的国际化字段；记录不存在时使用项目默认数据初始化。超级用户密码使用隐藏输入，临时传给子进程后清除。重置成功后，已打开的 App 会在最多 15 秒内同步更新。


## 客服订单、投诉图片与用户评价

智能助手的配给订单选择从现有订单存储读取，按当前公民的配给卡或代理的网点筛选；代理还可选择已有集中采购订单。咨询接口接收 `orderId` 并重新读取当前记录，不使用客户端提供的金额、状态或物资快照。对话历史按账号和角色保存在本机。

投诉记录仍保存于 `app_data` 的 `rcm_shared_complaint_<工单编号>` 键，新增字段均兼容旧工单：

- `relatedOrder`：可选的提交时订单快照，包括订单编号、状态、物资、支付金额及履约方式；管理端详情和处理窗口均展示。
- `photos`：可选的图片元数据数组，最多 5 张，每张不超过 5 MB，支持 JPEG、PNG、WebP。图片文件存入现有 `app_files` 集合，键前缀为 `complaint-photo-`，不把图片内容写入工单 JSON。请确保该集合的 File 字段允许上述类型及 5 MB 文件。
- `rating`：初始为 `null`。只有工单本人可在已办结后自愿提交一次 1–5 星评分及可选意见，保存评分人身份和时间。处理接口忽略客服传入的满意度、评分；旧 `satisfaction` 字段不再作为用户主动评价显示。

### 管理 Web 回访统计

“投诉和处理 → 回访统计”（`/#/complaint/statistics`）沿用 `complaints.view` 权限，从相同的投诉接口读取已同步工单，按提交日期、渠道、分类和省份筛选，无需新增统计集合。均分仅使用已办结工单的有效 `rating.score`；满意度为 4–5 星占比，低分为 1–2 星，覆盖率为已评价数 / 已办结数。历史 `satisfaction` 标签、未评价工单和无效评分均不计入均分。月度趋势使用评价时间。

客服评价按最后办理人汇总，新办理记录同时保存 `handlerId`、`handlerNameKey` 及办理历史，随工单 JSON 写入 `app_data`。旧记录按名称词条或姓名兼容汇总；少于 3 条评价显示样本不足。平均办理时长按有效的提交、办结时间计算，不代表员工实际工时。

工单保存为 `RESOLVED` 后，督办处置弹窗仅显示原始处理结果和状态。处理接口再次收到该工单的修改请求时返回 409，不修改状态、结果、办理人员或历史记录；用户仍可通过独立评分接口按原规则提交评价。

问题建议由投诉分类、投诉原文和评价意见中的多语言关键词规则归纳，并提供关联工单供人工核查。同一工单可关联多个主题；含低分的主题优先显示，同一主题至少 3 件工单标为重复出现。该规则分析不调用外部 AI 服务，也不改写用户评价。

无需新增 PocketBase 集合。跨设备状态和评价继续使用现有 15 秒同步机制，附件通过 PocketBase 文件接口按需读取。上述业务校验位于当前 Mock 适配层，正式后端接入时须实现相同的身份及工单权限校验（见上文“API 规则与访问安全”）。

本地回归：`node --test scripts/tests/customer-orders.test.mjs scripts/tests/customer-message-analysis.test.mjs scripts/tests/hold-to-talk.test.mjs`。浏览器回归脚本为 `scripts/tests/order-complaint.e2e.cjs`，可通过 `playwright-cli run-code --filename scripts/tests/order-complaint.e2e.cjs` 执行；需要预先打开浏览器会话及端口 3100 的 Vite 服务，并设置 `VITE_POCKETBASE_SYNC=false`。该脚本会清理隔离浏览器中的本地测试投诉和聊天记录，禁止针对线上同步环境运行。
