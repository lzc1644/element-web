<!--
Copyright 2026 lzc1644

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE in the repository root for full details.
-->

# 2026-10-13 上游同步记录与官方改动清单

## 同步范围

- 工作分支：`develop`；同步前：`00e449059508dbcf875e4ccd67991f996a36527c`，工作区干净。
- 保护分支：`backup/develop-before-upstream-2026-10-13`，保留同步前的完整历史。
- 官方来源：`https://github.com/element-hq/element-web.git`，remote 为 `upstream`。
- 上次已同步的官方基线：`b2dd6d57e3525c670f9dc94c33e706b761ae182d`，见 [10 月 4 日同步记录](upstream-sync-2026-10-04.md)。
- 本次最终目标：`e9e7f3f68bead2cbb1ea1129afcca690e31d5cb6`，官方提交时间为 2026-10-13 08:49:31 UTC。
- 首次拉取到 `4574916c67`，收尾复查又拉取并合并 3 个提交，最终共纳入 **85 个此前不在本地历史中的官方提交**。
- 其中 75 个在 develop 的 first-parent 路径上；另外 10 个来自 master 发布分支的合入，提交时间早于本次主干更新。
- 使用 merge 保留历史，不变基、不推送、不部署，不修改 Cloudflare 部署分支或实际部署配置。
- Web package 的版本变为 `1.12.30`，但本次同步的是 **develop**，还包含该稳定版发布之后的开发改动。

官方差异：[基线到最终目标的比较](https://github.com/element-hq/element-web/compare/b2dd6d57e3525c670f9dc94c33e706b761ae182d...e9e7f3f68bead2cbb1ea1129afcca690e31d5cb6)。

## 官方改动：用户可见功能与修复

### 安全、加密与登录

- **默认强制设备验证**（#35364）：`force_verification` 的默认值和示例配置改为 `true`。上游曾先引入、撤回再重新引入这一行为，最终目标以默认强制验证为准。实际部署显式配置该字段时仍以部署配置为准，本次没有改写它。
- **停止迁移旧 libolm 加密会话**（#35138）：遇到仍未迁移的旧加密存储时显示专门提示，而不是继续尝试迁移。官方提示先回到 `v1.12.30` 完成迁移，或移除旧设备。部署前应确认受影响用户的恢复密钥/备份，不能把删除旧设备当成无损迁移。
- 重做“Can't confirm?”验证帮助/身份重置对话框；只有没有其他验证选项时该入口才使用主按钮样式，没有其他操作时提供退出登录入口（#35375、#35406、#35307）。
- 修复设备监听器并发重新检查的问题，改为逐次执行（#35053）。
- 修复用户数字身份警告中的竞态，重构相应视图模型（#35372）。
- QR 登录采用新版 SDK 类型（#35249）；一致记录 `getPickleKey()` 失败，并调整密钥/令牌读取的错误处理和回归测试（#34955）。

### 通话与自托管

- **支持仅含 URL 的 LiveKit transport**（#35445）：不再要求发现结果必须带 `livekit_service_url`，也能识别例如 `{ type: "livekit", url: "wss://sfu.example.org" }` 的配置。这与自托管 RTC 服务发现直接相关，但不等于替代 Element Call 前端 URL 配置。
- 新增 **MatrixRTC call slots** 实验功能（#34392），处理 slot 状态及开通权限；`feature_matrixrtc_slots` 默认关闭，不会因本次同步自动开启。
- 移除 `feature_disable_call_per_sender_encryption` 及 Element Web 对旧 `perParticipantE2EE` 参数的注入/监听（#35396），采用官方新的通话参数处理。旧的“禁用每发送者加密”实验开关不再有效，不保留本地旧实现来覆盖官方。
- 通话 Widget capabilities 增加 functional members 相关状态事件权限（#35323）。
- `matrix-widget-api` 升级到 1.20.0（#35424）；内置 Element Call 升级到 0.26.1（#35334）。
- Element Call React component 固定到官方 commit hash，移除 Web 的直接 `livekit-client` 依赖及旧 override（#35430）。React component 嵌入实验开关仍默认关闭。
- 通话相关测试不再调用内部 `CallMembership` 构造函数（#35316）。

### 界面、时间线、地图与通知

- **修复地图空白**（#35423）：显式打包和加载 MapLibre Worker，合并新增 Worker entry 与测试，不用本地旧 Webpack 配置覆盖它。
- **修复路由竞态**（#35385）：处理登录/登出及 room URL 导航的状态变化，增加路径、查询参数和跳转回归测试。
- 新时间线在 viewport 高度变化时继续保持底部锚定（#35374）；该行为适用于启用的新时间线，不代表旧时间线全部改造。
- Labs 通知设置不再重新写入服务器已经删除的旧 mention push rules（#35035）。
- 用户状态移到头像下方（#35328）；通用 Pill / PillInput 的外观与输入框设计更新（#35370）。
- Widget 画中画中的长房间名使用省略显示，避免撑破布局（#35329）。
- 修复 restricted-guests 模块重新显示本应禁用的 UI（#35412）。
- 模块对话框允许不设置标题，同时支持独立的 accessible label（#35362）。
- 英文措辞及多语言翻译更新（#35289、#35121、#35326、#35421）：包括 account provider、device、digital identity 等术语、恢复与文件面板说明。

## 官方改动：依赖、工程与发布

- pnpm 从 11.23.0 升级到 **12.11.2**；配套更新 CI 安装步骤（#35354）。
- `@vector-im/compound-web` 升级到 **10.3.1**、design tokens 到 **11.2.0**；shared-components 发布为 **0.2.1**（#35390、#35378）。
- `sanitize-html` 升级到 **2.18.0**，更新多项依赖安全修复和 overrides，使依赖树满足官方 pnpm audit 修缮（#35351、#34990）。本次未额外执行线上漏洞审计，不把导入这些修复表述为所有依赖均无漏洞。
- Sentry Browser 升级到 v11、Motion 到 v14；更新 PostCSS preset env、Stylelint、unplugin-dts、Storybook lint 插件（#35355、#35357、#35350、#35352、#35367、#35346）。
- Oxfmt 升级到 **0.72.0**、Oxlint 到 **1.87.0**，随官方合入相应 lint 兼容调整（#35353）。
- Desktop 的 Electron 最终升级到 **44.7.0**，electron-builder 到 **26.17.0**；调整 node-abi 与 Debian Maintainer 字段（#35335、#35386、#35336、#35338）。这些属于 monorepo 的桌面部分，不是 Web 自托管的新功能。
- 更新 Rust、Nginx、Dockerfile frontend、Synapse/MAS/LiveKit 等测试容器的版本/digests，以及 GitHub Actions / Cloudflare Wrangler Action（#35303、#35304、#35333、#35339、#35340、#35341、#35365、#35383、#35387）。
- 优化 Synapse 测试服务性能；修复音频播放器、房间列表、邀请、Vitest / Playwright 的不稳定测试（#35099、#35305、#35317、#35327、#35342、#35373、#35389、#35392）。
- 合并下载的测试报告、覆盖 Vitest blob artifacts，并调整 Renovate 的测试容器更新计划（#35400、#35402、#35369）。
- 共享 clipboard/email 工具迁移、React 19 `useEffectEvent` 重构、清理旧 React SDK Module API 和维护 CODEOWNERS / PR 模板（#35361、#35368、#35332、#35377、#35363）。
- master 发布分支的 10 个历史提交也进入本地历史：v1.12.30 / RC 发布、SDK 43.0.0 发布、模块 API 2.2.0 / X.509 IPC，以及 Banner / Univention 修复。这些不能全部算作 10 月新推出的功能。

## 本地功能取舍与合并处理

- **搜索完整保留**：浏览器 Worker / IndexedDB 索引、历史回溯、消息搜索、文件名/日期/发件人/类型筛选、文件与媒体分页、虚拟化、编辑/撤回投影及下载入口没有对应的官方替代。核心 `Searching.ts`、`indexing/`、`search/`、`RoomSearchView.tsx`、`FilePanel.tsx` 与同步前一致。
- **自托管 Element Call 入口保留**：开发者 URL > `element_call.url` > 内置包的优先级、外部 `/room` 路由、hash 参数处理及旧 terminate 事件权限仍在。官方 RTC 功能、LiveKit transport 识别、依赖及生命周期更新正常采用，不把外部 iframe 地址硬套到 React component 分支。
- **64px 窄侧栏保留**：连续宽度调整、像素宽度持久化、头像模式和完全折叠/展开仍有效，上游没有等效替代。不是重新恢复早先已经舍弃的旧 68px 实现。
- 修复验证时发现的本地交互缺陷：快速拖动离开 separator 后，缺失中间 pointer move 会把松手误当点击，使 64px 或 0px 面板重新打开到 370px。pointer up 现在检查最终坐标；新增两项单测和真实浏览器窄栏/重载回归。单独提交为 `0771aacd62`，不混作官方新功能。
- 文件面板冲突采用官方空状态措辞，保留本地筛选、状态提示及错误重试断言。文本快照保留本地 DOM 结构。
- 房间列表文本快照冲突保留本地窄栏结构；更新的 29 项快照只涉及 Compound 的 CSS hash。归一化新旧 hash 后，相关本地快照结构与同步前一致。
- 修正自动合并漏报的锁文件不一致：Web 的 `react-virtuoso` importer 使用官方锁文件已有的 **4.18.16**，没有重新解析整棵依赖树或引入额外升级。
- 媒体月份分组测试使用月中本地日期，避免 UTC 月初在负偏移时区落入上个月；侧栏组件拖动测试指定实际起点，不依赖浏览器残留的指针位置。
- 官方旧折叠 E2E 的固定 -300px 假设改为按当前宽度折叠，补齐 mouse up，并检查最终实际尺寸。新增 64px 房间点击与重载持久化用例，不靠删除窄栏功能让旧测试通过。

## 验证结果

最终验证针对 `e9e7f3f68b` 的合并结果：

- 官方锁文件安装通过，Node **24.21.0** / pnpm **12.11.2**。
- `pnpm -r --workspace-concurrency=1 lint:types` 通过，包括 Web 主程序、浏览器测试和 Playwright。
- `nx run element-web:build` 生产构建通过，仍有 **10 条构建警告**，主要为资源体积、CSS 和 MapLibre 动态依赖提示。
- Web 定向 Vitest：**38 个文件、655 项通过**，覆盖本地搜索/索引/附件/侧栏、自托管通话和官方 RTC、路由、地图、设备监听、身份警告、通知、存储与 service worker 更新。
- shared-components 定向真实 Chromium 单测：**24 个文件、231 项通过**。
- 真实 Chromium Worker / IndexedDB：**6 项通过**。
- 上述单元与浏览器测试合计 **892 项通过**；没有把可选性能基准算入验收。
- Chrome 登录态 E2E：**13 项通过**，覆盖连续侧栏缩放、64px 房间点击和重载持久化、完全折叠/展开、跨空历史批次查找、真实消息跳转、加密图片下载、预览隐藏/失败、长文件名、窄媒体面板和官方真实 React 通话组件挂载/主题。
- E2E 最终使用本次生产包、临时 `127.0.0.1:18180` 服务和 Synapse 容器，不使用残留开发服务；临时服务及此前测试启动的 watch 进程已停止。
- `pnpm i18n`、手工调整文件的 Oxfmt / Oxlint、相对目标上游的空白差异和冲突标记检查通过。
- 导入的 **56 个 PNG** 与官方目标逐文件一致，已查看前后变更区域：变化为官方措辞、Pill / 输入框设计、用户状态位置、身份重置和画中画等。未本地重生成图片基线。

### 环境与验收边界

- 本机被忽略的 `.link-config` 是 `matrix-js-sdk=/path/to/matrix-js-sdk=apps/web` 的占位配置，普通 postinstall 会造成失效 SDK 链接。保留该文件，安装验证使用 `PLAYWRIGHT_COMMON_DOCKER=1 pnpm install --frozen-lockfile` 跳过本地 link 脚本并恢复官方锁定 SDK；该变量不意味着本次安装或测试在 Docker 中执行。以后本机普通安装前应修正该配置。
- 曾在构建/类型任务与浏览器测试并行时遇到 iframe 初始化超时，以及一次搜索取消断言不稳定；停止测试启动的 watch 进程、避免并行改写依赖构建产物后，最终定向套件全部通过，没有修改搜索代码来隐藏失败。
- 本次不是全量 unit、全量 lint、全量 E2E、性能测试或覆盖率验收。部分原有单测仍输出 React act / 嵌套 button 警告。
- E2E 使用 `--ignore-snapshots`，通过的是交互断言，不是 Docker 环境的像素比较。官方 PNG 原样导入不证明定制文件面板等场景与官方截图像素一致；这些场景的图片基线未重新验收。
- 消息跳转用例虽然沿用含 StrictMode 的名称，最终 E2E 跑的是生产包，不以此声称验证开发环境的 effect 重放。
- 没有验证外部自托管通话服务器的实际连接、音视频收发、旧外部 Element Call 版本兼容性，也没有验证 ChromeZoom 的精确缩放档位。
- Git 全量差异中的官方 API 文档 CRLF 和文本快照末尾空格原样保留；相对官方目标没有新增空白错误。

## 完整官方提交清单

以下为 `git log b2dd6d57e3..e9e7f3f68b` 的 85 项原始提交标题；日期是提交自身日期，不是本次合入日期。末尾的较早发布分支提交由 10 月 6 日的 master merge 带入。

```text
e9e7f3f68b 2026-10-13 Update oxc (#35353)
f8e298d98d 2026-10-13 Allow using Element Call with URL-only LiveKit transports (#35445)
733b7b2afc 2026-10-13 Update electron (#35386)
4574916c67 2026-10-13 [create-pull-request] automated change (#35421)
f82a8eafe3 2026-10-13 Fix more race conditions in routing (#35385)
b8ddf92e7e 2026-10-13 Update pnpm (#35354)
aed4ed399c 2026-10-12 Bump matrix-widget-api to 1.20.0 (#35424)
b369540cc2 2026-10-12 Ensure 'Can't confirm?' is primary only if no other options are available (#35406)
efca432abd 2026-10-12 Fix blank maps by bundling the maplibre-gl worker explicitly (#35423)
702043ca57 2026-10-12 Don't allow to skip device verification by default (#35364)
5fbc912664 2026-10-12 Use hash version for @element-hq/element-call-component + remove `livekit-client` (#35430)
171955a9e2 2026-10-09 Satisfy pnpm audit (#34990)
795a9315b7 2026-10-09 Fix restricted guest module showing excluded UI elements (#35412)
ba531b906d 2026-10-09 Remodel "Can't confirm" dialog to match designs (#35375)
1ddb4049e0 2026-10-09 Update compound-web to 10.3.1 (#35390)
f03ce37cce 2026-10-09 Deflake playwright tests (#35392)
4b3af283fb 2026-10-09 Always merge downloaded test reports (#35400)
0e9c433a39 2026-10-09 [create-pull-request] automated change (#35326)
16e939b028 2026-10-09 Overwrite vitest blob artifacts (#35402)
d89ee058f2 2026-10-09 Remove feature_disable_call_per_sender_encryption (#35396)
ec6c5ea7ab 2026-10-09 Fix flaky room-list-panel playwright tests (#35389)
263a2b56d9 2026-10-08 Run DeviceListener rechecks one at a time (#35053)
52f5cb57f9 2026-10-08 Move `string.copyPlaintext` and `Email.looksValid` to shared utils (#35361)
83cbced152 2026-10-08 Use MatrixRTC slots behind labs flag (#34392)
e395689fdf 2026-10-08 Update docker.io/docker/dockerfile Docker tag to v1.28 (#35387)
56ec209d49 2026-10-08 Drop support for migrating libolm sessions (#35138)
80e525a6dc 2026-10-08 Update actions/download-artifact digest to 9000827 (#35383)
4717d533c8 2026-10-08 Update dependency sanitize-html to v2.18.0 (#35351)
c0ecf19832 2026-10-08 Update cloudflare/wrangler-action digest to 953926a (#35339)
5491852d7e 2026-10-08 Add functional members to the element call capabilities (#35323)
d0c778e8c4 2026-10-08 Update `Pill` and `PillInput` design (#35370)
eb891a22b4 2026-10-08 Refactor UserIdentityWarning to fix race conditions (#35372)
cfeb5e67ae 2026-10-07 Keep the new timeline at the bottom when its viewport changes height (#35374)
4d1993cc38 2026-10-07 Bump shared components to 0.2.1 (#35378)
2ee2f13994 2026-10-07 Codeowners device listener -> crypto team (#35377)
41d5cc1d3b 2026-10-07 Switch audio-player.spec.ts to using a retrying assertion (#35373)
20ffddae23 2026-10-07 Open renovate PRs for testcontainers digests on a schedule (#35369)
fa48f2ce54 2026-10-07 Allow module dialogs without a title (#35362)
573b2abb74 2026-10-07 Refactor hooks to use React 19's `useEffectEvent` (#35368)
32a835405b 2026-10-07 Offer 'Sign out' on the identity reset page if there is no other option (#35307)
a16dc9022e 2026-10-07 Update dependency stylelint to v17.16.0 (#35352)
2f1f2b3b73 2026-10-07 Add AI assistance checkbox to PR template (#35363)
8ecafca54b 2026-10-07 Improve Synapse test run performance (#35099)
6c2e29e27b 2026-10-07 Update testcontainers docker digests (#35365)
fb80ecba01 2026-10-07 Update dependency unplugin-dts to v1.1.2 (#35367)
dc238bef71 2026-10-07 Update dependency @sentry/browser to v11 (#35355)
4ca56fecf7 2026-10-07 Update dependency eslint-plugin-storybook to v10.6.1 (#35346)
161aef320f 2026-10-07 Stop writing removed legacy mention rules from the Labs notification settings (#35035)
30c3d0ddd7 2026-10-06 Update dependency postcss-preset-env to v11.6.0 (#35350)
0545871a76 2026-10-06 Update dependency motion to v14 (#35357)
386d96bf78 2026-10-06 Update electron (#35335)
7e0a4fbecd 2026-10-06 Update testcontainers docker digests (#35333)
ebac4c64f6 2026-10-06 Update dependency @element-hq/element-call-embedded to v0.26.1 (#35334)
ed149b72d4 2026-10-06 Clean up leftover bits relating to the React SDK Module API (#35332)
3c3db95f1a 2026-10-06 Fix sliding sync invite flake (#35342)
417fa60b0e 2026-10-06 Revert "Do not allow skip device verification by default (#35259)" (#35343)
dcee700869 2026-10-06 Ellipsise long names in widget picture-in-picture view (#35329)
edc85b8e7b 2026-10-06 Fix Debian control file Maintainer field (#35338)
69319bf8f6 2026-10-06 Update electron-builder to v26.17.0 (#35336)
56442f44b1 2026-10-06 Update rust:bookworm Docker digest to fbc3a35 (#35341)
01e2eb7bfb 2026-10-06 Update nginxinc/nginx-unprivileged:alpine-slim Docker digest to 1517d8c (#35340)
aede8af6ef 2026-10-06 Put user status below the avatar (#35328)
816ccc50ce 2026-10-06 Merge remote-tracking branch 'origin/master' into develop
063a046cfa 2026-10-06 Deflake more vitest tests (#35327)
789de241d3 2026-10-06 Do not allow skip device verification by default (#35259)
500a931600 2026-10-06 Update testcontainers to v12.2.0 (#35305)
eb2093cf1b 2026-10-06 [create-pull-request] automated change (#35121)
cd558745a7 2026-10-05 Log getPickleKey() failures consistently (#34955)
2d42295702 2026-10-05 Fix some Vitest flake issues (#35317)
a0ad56456c 2026-10-05 Refactor Sign in with QR to use new SDK types (#35249)
b243535523 2026-10-05 Update modules playwright screenshots (#35320)
066518dfd7 2026-10-05 Collection of EN string changes, Pt. 2 (#35289)
36a6691b92 2026-10-05 Don't use internal CallMembership constructor (#35316)
baff62f58e 2026-10-05 Update testcontainers docker digests (#35303)
1845ae20ab 2026-10-05 Update github-actions non-major dependencies (#35304)
f19cfd9030 2026-09-29 v1.12.30
02ac72b830 2026-09-29 [Backport staging] Update Banner module in Dockerfile to v2.1.1 (#35250)
f2eff12397 2026-09-29 Upgrade dependency to matrix-js-sdk@43.0.0
c076d1c47a 2026-09-29 [Backport staging] Fix banner module's logo_href not working in Univention mode (#35245)
0610f02757 2026-09-23 v1.12.30-rc.1
5b5f82fc6c 2026-09-23 v1.12.30-rc.0
3556583f5f 2026-09-23 [Backport staging] Prepare module-api 2.2.0 release (#35149)
9aa127c9a3 2026-09-23 [Backport staging] Implement the X.509 IPC into the module API (#35146)
3fd20b83a6 2026-09-23 Update dependency @element-hq/element-call-embedded to v0.26.0 (#35142) (#35147)
0348943eb0 2026-09-22 Upgrade dependency to matrix-js-sdk@43.0.0-rc.0
```
