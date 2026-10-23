# PocketBase 业务数据同步设置

前端使用当前演示 API，PocketBase 作为共享业务数据存储。启动时先从 PocketBase 读取共享数据；若集合中还没有记录，首次运行的设备会把已有业务缓存写入 PocketBase。后续业务缓存写入会同步到 PocketBase，已打开的客户端每 15 秒读取一次更新。

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
