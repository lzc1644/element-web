<!--
Copyright 2026 lzc1644

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE in the repository root for full details.
-->

# 2026-10-29 上游同步记录

## 范围与当前 Git 状态

- 工作分支：`develop`；同步前为 `39ae088aea77345e0a9f49bad06ab1ef273b13b0`，工作区干净。
- 保护分支：`backup/develop-before-upstream-2026-10-29`，保留同步前历史。
- 官方来源：`https://github.com/element-hq/element-web.git`，remote 为 `upstream`。
- 上次官方基线：`e9e7f3f68bead2cbb1ea1129afcca690e31d5cb6`，见 [10 月 13 日同步记录](upstream-sync-2026-10-13.md)。
- 本次目标：`70e779c3c4def7099847586c9b1dfab9948814ca`，提交时间为 2026-10-29 15:38:41 UTC。
- 新纳入 **115 个官方提交**，其中 103 个在 develop 的 first-parent 路径上，另 12 个由发布分支合入。
- 使用 `git merge --no-commit --no-ff upstream/develop`，保留本地历史，不变基。
- 内容整合和验证完成后，经用户授权，以本地 merge commit 保存到 `develop` 历史。
- 不推送、不部署，不修改 Cloudflare 分支或实际部署配置。
- Web package 版本为 `1.12.32`，同步对象是 develop，含该版本发布后的开发改动，不是切换到 `v1.12.33` 稳定版标签。

官方差异：[基线到本次目标的比较](https://github.com/element-hq/element-web/compare/e9e7f3f68bead2cbb1ea1129afcca690e31d5cb6...70e779c3c4def7099847586c9b1dfab9948814ca)。

## 官方主要更新

### 通话与 Widget

- 新增 **Document Picture-in-Picture**：Element Call React 组件可移入浏览器独立的置顶窗口，并返回原窗口，保持组件实例及通话状态（#35002）。依赖浏览器 API；`feature_element_call_react` 仍按官方默认关闭，不自动把外部 iframe 通话切成 React 组件。
- 修复错误界面切换房间后通话重新出现、已加入但 membership 尚未同步时通话被销毁、语音跳过 lobby 时的 PiP 行为，以及已有通话的最大化逻辑（#35470、#35495、#35443、#35002）。
- 修复 PiP 拖动条被 Widget 遮挡，以及 CallStore 初始化的未处理 Promise 拒绝（#35395、#34861）。
- Widget 增加 LiveKit token / delayed leave 的 homeserver 代理能力；加密 to-device 消息展开设备通配符 `*`，并正确向 Widget 传送线程回复（#35446、#35183、#35444）。
- SDK delayed-event API 改用数值 delay，采用官方调用方式（#35413）。
- React 通话组件升级到官方锁定提交；embedded 包曾升到 0.28.0，随后官方撤回，**最终保留官方 0.26.1**（#35517、#35549），不单独恢复被撤回版本。

### 恢复密钥、登录与安全

- 设置、修改恢复密钥及删除 key storage 改用对话框；简化创建恢复密钥流程，登出时使用新的恢复提示，并允许最后一个设备登出前生成恢复密钥（#35552、#35474、#35451、#35398、#35401）。
- 修复 OIDC guest 登录、登录时模块 profile 更新，以及删除自定义 profile 字段的请求语义（#35432、#35562、#34844）。
- 移除旧 `guest_access_token` / `guest_user_id` URL 登录参数，以及消息中的 NEB starter links 支持；不恢复官方已移除的旧入口。
- Desktop 使用异步 safeStorage API，修复 X.509 IPC 数据传递，并按整条证书链最早的 `validTo` 判断有效期（#34965、#35601、#35522）。

### 消息、界面与稳定性

- 新时间线支持已读回执，仍受相应 Labs 功能控制，不因同步自动启用新时间线（#35276）。
- 文档预览增加返回按钮；自定义消息渲染器支持 informational message 与 sender profile hints（#35585、#35371）。
- 修复 `/spoiler` 的 Markdown 转 HTML、屏幕下方房间预览崩溃；URL preview 使用稳定 capability 并兼容旧前缀（#35103、#35490、#35438）。
- 修复 service worker 事件注册及强制刷新后的媒体鉴权接管（#35388），保留浏览器本地索引入口。
- 引入监听器、定时器、订阅及 debounce/throttle 的资源清理规则，并修复相关卸载竞态；更新多语言和恢复流程文案。

### 工程与依赖

- pnpm 升级为 **12.14.0**，Playwright **1.64.1**，Nx **23.3.0**，Vitest **5.0.5**，Oxfmt **0.73.0**，Oxlint **1.88.0**。
- Compound Web **10.4.0**、design tokens **11.3.0**、shared-components **0.2.2**；SDK 采用官方锁文件的 develop 提交。
- 导入 `sanitize-html` **2.18.1** 和 Storybook **10.6.2** 的更新，以及 Webpack、Vite、测试容器和 Actions 权限修复；Desktop Electron 为 **44.9.3**。

## 本地能力与合并取舍

本次未发现能够完整替代以下核心定制的官方实现，因此没有删减这些功能：

- **浏览器消息搜索和索引**：Worker / IndexedDB、历史回溯、编辑与撤回投影、消息跳转完整保留。`apps/web/src/indexing/`、`search/`、`viewmodels/search/`、`Searching.ts`、`RoomSearchView.tsx` 与同步前一致。
- **文件与媒体面板**：文件名、日期、发件人、类型筛选，分页、虚拟化、下载、状态及错误重试保留。官方 FilePanel 的异步挂载防泄漏修复不直接套回旧 timeline 结构：本地已经同步注册 `RoomFileLiveEvents`，卸载时取消订阅并 dispose。扩展现有单测，检查查询未结束就卸载时移除原监听器，查询返回后不再注册监听器。面板源代码与同步前一致。
- **64px 头像窄栏**：连续拖动、像素宽度持久化、完全折叠和点击展开保留。相关共享组件源代码与同步前一致；保留快速拖动缺少中间 pointer move 的回归覆盖。
- **自托管 Element Call**：保留开发者 URL > `element_call.url` > embedded 包的优先级、外部 `/room` 路由、hash 参数及旧 terminate 事件权限；通话生命周期、Widget 新能力、React 组件和 PiP 则采用官方更新。
- 保留已有循环依赖延迟导入，合入官方 ReadyWatchingStore 的 destroy 清理，不以旧版本整体覆盖新文件。

合并适配：

1. 解决 FilePanel、侧栏拖动 E2E、ResizerViewModel 单测三处冲突，保留本地能力及官方新增的异步测试等待。
2. 自动合并还为同步版 `RoomView.onSearchChange` 和 `ResizerViewModel.onLeftPanelResize` 加上了 `.cancel()`。这两个本地回调已不是 debounce，移除不适用的清理调用，避免类型错误和卸载异常。
3. 侧栏普通拖动采用官方的 10 步指针移动；头像窄栏回归显式使用单步快速拖动。截图改用 Playwright 的 test output 路径，不继续写旧日期的固定 `/tmp` 路径。
4. 官方新增 PiP E2E 初跑时找不到生产构建已移除的 `data-testid`，但可访问性树中按钮存在。改按按钮角色和名称定位后，两项真实独立窗口用例通过。
5. WebPlatform 单测隔离本地 Worker manager，让官方 service worker 回归在非 Worker 测试环境运行；真实 Worker 另有 Chromium 验证。
6. 新版 lint 在根目录遗留 Worker 中发现 10 处多余类型断言，作类型层适配并按 Oxfmt 格式化；未改索引行为或将旧副本替代现行 `apps/web` 实现。
7. 锁文件冻结安装直接通过；保留本地 `react-virtuoso` importer，无需重新解析整棵依赖树。

## 验证结果

环境：Node **24.22.1** / pnpm **12.14.0**，测试浏览器为 Playwright 配套 Chromium。

- `PLAYWRIGHT_COMMON_DOCKER=1 pnpm install --frozen-lockfile` 通过。沿用前次记录的方式跳过本机 `.link-config` 占位链接，不改写本地配置；该变量不表示安装在 Docker 中执行。
- `nx run-many -t test:unit:prepare -p` 通过。
- `pnpm -r --workspace-concurrency=1 lint:types` 通过，包括 Web 主程序、浏览器测试及 Playwright。
- `nx run element-web:build` 生产构建通过，有 **10 条构建警告**，包括资源体积、CSS、动态依赖和 runtime chunk 建议。
- **Web 定向单测：46 个文件、699 项通过**，覆盖本地搜索/索引/附件/侧栏和官方通话、Widget、service worker、恢复密钥、右面板及已读回执更新。
- **shared-components 真实 Chromium 单测：24 个文件、231 项通过**，覆盖侧栏、房间列表和自定义搜索视图。
- **真实 Chromium Worker / IndexedDB：1 个文件、6 项通过**。
- **Desktop 存储 / X.509 与新 lint 规则：7 个文件、141 项通过**。
- 上述单元及浏览器测试合计 **78 个文件、1077 项通过**。
- **Chrome 登录态 E2E：16 项通过**：侧栏 3 项、搜索/附件 8 项、真实 React 通话组件 3 项、官方 Document PiP 2 项。PiP 使用 mock 通话组件和真实浏览器窗口。
- E2E 使用本次生产包、`127.0.0.1:18180` 临时服务及 Synapse 测试容器。8080 上其他服务没有被复用；临时服务与测试容器已清理。
- `pnpm lint:js` 全仓通过；手工调整文件的 Oxfmt 检查通过；`pnpm i18n` 通过且没有额外译文差异。
- 导入的 **16 个新增或修改 PNG** 与上游一致，已查看前后变化；另删除官方撤掉的恢复流程和 starter-link 基线。未本地重生成截图基线。事件列表中的 `<<replaced_bot1_id>>` 是现有测试主动替换随机用户 ID 的确定性文本。

### 验收边界

- 未运行全量 unit、全量 E2E、性能或覆盖率检查，也未运行包含样式、workflows 和 knip 的全量 `pnpm lint`。
- E2E 使用 `--ignore-snapshots`，验证交互而非 Docker 像素比较；导入官方 PNG 不代表定制场景的像素回归全部通过。
- 仍有既有 React act、嵌套 button、旧 JSX transform 及 Vite 配置提示。
- 未连接实际外部自托管通话服务器验证音视频、旧外部版本兼容性，未运行 ChromeZoom 的精确页面缩放测试。
- 搜索跳转用例沿用含 StrictMode 的名称，本次运行的是生产构建；开发环境 effect 重放尚未验证。
