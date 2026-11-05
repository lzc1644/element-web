<!--
Copyright 2026 lzc1644

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE in the repository root for full details.
-->

# 2026-11-05 上游同步记录与官方改动清单

## 同步范围

- 工作分支：`develop`；同步前为 `6ef5f900616a387fa6be276079c089fbacd78354`，工作区干净。
- 保护分支：`backup/develop-before-upstream-2026-11-05`，保留同步前完整历史。
- 官方来源：`https://github.com/element-hq/element-web.git`，remote 为 `upstream`。
- 上次官方基线：`70e779c3c4def7099847586c9b1dfab9948814ca`，见 [10 月 29 日同步记录](upstream-sync-2026-10-29.md)。
- 本次目标：`329b011e1ecf4cab0df8e88545dd87fdac798cae`，提交时间为 **2026-11-05 09:59:18 UTC**；收尾核对官方 develop 仍指向此提交。
- 新纳入 **71 个官方提交**，均在 develop 的 first-parent 路径上，官方改动涉及 253 个文件。
- 使用 `git merge --no-commit --no-ff upstream/develop`，解决冲突并验证后保存为本地 merge commit；不变基、不推送、不部署，不修改 Cloudflare 部署分支或实际部署配置。
- 本次同步的是 **develop**，不是切换到稳定版标签。Web package 的版本仍为 `1.12.32`，不能仅凭界面的版本号判断是否包含这些开发分支更新。

官方差异：[上次基线到本次目标的比较](https://github.com/element-hq/element-web/compare/70e779c3c4def7099847586c9b1dfab9948814ca...329b011e1ecf4cab0df8e88545dd87fdac798cae)。

## 官方主要更新

### 通话与自托管 RTC

- **支持稳定的 `m.livekit` transport**，同时兼容旧的 `livekit`。为 React 通话组件选择已配置的服务地址时，优先使用带 `livekit_service_url` 的 `m.livekit` transport（#35602）；保留 URL-only transport 识别。
- **Element Call React 组件改用正式 npm 包 `0.28.1`**，不再从 Element Call 仓库的 Git 提交构建组件（#35637）。本次采用官方方案，同时移除上游不再需要的 Git dependency build allowlist。
- 内置 iframe 版本的 Element Call 从 **0.26.1 升到 0.28.0**（#35665）；与前次同步中曾被撤回的升级不同，本次官方最终目标已经重新采用此版本。
- `feature_element_call_react` 仍按官方默认关闭；同步不会将自托管外部 iframe 强制切换到 React 组件。

### 恢复密钥、登录与数字身份

- **退出登录时可直接检查恢复密钥**，不必离开退出对话框；有错误密钥提示、检查失败处理，以及验证成功后的继续移除设备流程（#35404）。
- 重置数字身份的提示按设计调整；没有已加入的加密聊天时使用较温和的说明，有破坏性影响时补充“其他已登录设备需要重新确认”的提示（#35415、#35574）。
- **修复 QR 登录的带外确认顺序**：用户确认检查码之后才继续授权；自动打开验证页面被浏览器拦截时提供手动入口，错误时取消 rendezvous，避免另一设备持续等待（#35251）。
- 加密设置中的标题颜色修正为主要文本色（#35643）。

### 房间列表、权限与时区

- **房间列表主筛选持久化**：刷新或重新打开应用后恢复选中的筛选；已不可见或不再适用的筛选不会被恢复（#35420）。这是房间列表筛选，不是本地消息/附件搜索的替代方案。
- 修复缺少 Space 权限时仍提供“New room”的问题（#35692）。
- 修复 `UIFeature.allowCreatingPublicRooms` / `UIFeature.allowCreatingPublicSpaces` 对“将已有私有房间或空间改成公开”的控制，并补全文档（#35591、#35612）。
- 模块可以完全禁用公开房间相关入口，相关设置联动遵循模块控制（#35641）。
- **允许通过部署配置的 `setting_defaults.userTimezone` 设置默认时区**；正确读取配置层，规范化时区大小写，非法值回退到浏览器默认，并在下拉列表显示配置中的有效时区（#35631、#35650）。本次没有自动修改实际部署的时区。

### 消息、地图与界面

- 修复气泡布局中媒体说明文字与时间戳重叠（#35644）。
- 修复新房间介绍缺失邀请图标（#35695）。
- 修复用户菜单截断状态下拉菜单，增加相关展示用例（#35649）。
- MapLibre 升级后统一从包装模块设置 Worker URL，避免 Webpack 将地址改写为 `file://` 后导致地图空白；地图加载期间标记 `aria-busy`，截图等待地图绘制完成（#35347、#35705）。
- 加固 Banner 的 Univention 导航和静默登录处理（#35646），更新匈牙利语、瑞典语、简体中文等翻译。

### Desktop、工程与依赖

- Desktop 修复 macOS / Windows 迁移明文 secrets 时的启动退出问题（#35581）。
- Desktop 增加 `spell_checker_dictionary_download_url`，可以自托管 Hunspell 词典下载服务；macOS 使用系统拼写检查，不受此设置影响（#35605）。
- **Node 配置从 24 升为 26**；Desktop 固定 **26.13.0**。Web / 根 package 的 engines 仍为 `>=22.18`，但本次生产构建实际使用 Node 26.13.0 通过（#35667）。
- pnpm **12.16.1**、Nx **24.0.3**、React / React DOM **19.3.1**、Vite **8.3.5**、Webpack **5.112.2**、Oxfmt **0.75.0**、Oxlint **1.90.0**。Docker 中 pnpm 镜像另按上游升级到 **12.17.0**。
- shared-components **0.2.3**、MapLibre **6.16.0**、react-resizable-panels **4.14.5**；更新 dnd-kit、linkify、PostCSS、KaTeX、what-input、PostHog、测试及其他非主版本依赖。
- 合入 happy-dom / glob 的安全更新（#35668、#35642）；Desktop Electron **44.10.1**、electron-builder **26.18.0**。
- 开发 watch 构建不再清空 shared-components 输出目录，避免消费者编译时文件短暂消失（#35563）；修复共享组件类型错误（#35616）。
- 增加测试资源 teardown lint 规则与 `tearDownAfterTest` / `TestSDKContext`，清理定时器、dispatcher 和通知状态资源；本地适配采用官方 helper（#35598）。
- Playwright 不稳定测试问题可自动分配给最近修改者；更新工作流、Actions、测试容器和 Renovate 计划，新增 CLA bypass 机制，移除 macOS 构建中不再需要的 Python setup（#35638、#35604、#35609、#35654 等）。

## 本地能力保留与官方方案取舍

本次没有发现可以完整替代核心定制的官方实现，因此保留以下功能：

- **浏览器本地消息搜索**：Worker / IndexedDB、历史回溯、编辑与撤回投影、分页、停止/继续和消息跳转。
- **文件与媒体面板**：文件名、日期、发件人、类型筛选，虚拟化、分页、下载、错误提示与重试。
- **64px 头像窄栏**：连续拖动、像素宽度持久化、房间点击、完全折叠/展开，以及快速拖动缺少中间 pointer move 的修复。
- **自托管 Element Call**：开发者 URL > `element_call.url` > 内置包的优先级、外部 `/room` 路由、hash 参数及旧 terminate 权限。通话组件依赖、RTC transport、生命周期与 PiP 使用官方更新。

合并前后，`apps/web/src/indexing/`、`search/`、`viewmodels/search/`、`Searching.ts`、`RoomSearchView.tsx`、`FilePanel.tsx`、`ResizerViewModel.ts` 和窄栏面板核心源代码没有变化。

四处文本冲突的处理：

1. `RoomSearchView.test.tsx`：采用官方 `TestSDKContext`，保留本地搜索 mock 和所有定制回归断言；不恢复只适用于官方旧搜索结果结构的测试。
2. `WebPlatform.ts`：同时保留本地 `WebEventIndexManager` 入口与官方 update interval / destroy 清理，不用任一侧整文件覆盖另一侧。
3. `ResizerViewModel.test.ts`：采用官方 teardown helper，保留像素宽度和快速拖动回归，以及本地接口需要的 pointer up 坐标。
4. `pnpm-lock.yaml`：保留 Web 的 `react-virtuoso` importer，使用官方锁文件已有的 **4.18.19 / React 19.3.1** 组合；相对官方锁文件仅新增这三行 importer，没有重新解析整棵依赖树。

## 验证结果与构建注意事项

- 冻结锁文件安装通过：`PLAYWRIGHT_COMMON_DOCKER=1 pnpm install --frozen-lockfile`，pnpm **12.16.1**。沿用此前记录的方法跳过本机 `.link-config` 占位链接，不改写该文件；该环境变量不表示安装在 Docker 中运行。
- `nx run-many -t test:unit:prepare -p` 通过。
- `pnpm -r --workspace-concurrency=1 lint:types` 全仓通过，包括 Web、浏览器测试和 Playwright。
- **定向单元与浏览器测试共 71 个文件、1043 项通过**：首轮 718 项、补充权限 / Banner / teardown 测试 85 项、shared-components 真实 Chromium 测试 240 项。包含真实 Worker / IndexedDB 的 6 项测试；2 项可选性能基准按原配置跳过。
- **生产构建通过**：Node **26.13.0** 下 `nx run element-web:build` 成功，仍有 10 条资源体积、CSS、动态依赖和 runtime chunk 等警告。
- 本机 Node **24.22.1** 的首次构建在 Terser 压缩阶段发生进程段错误；改用上游指定的 Node 26.13.0 后通过。建议部署构建环境同步使用 Node 26；没有据此提高 package engines 或修改压缩配置。
- **Chrome E2E 共 20 项通过**：压缩生产包上 18 项，覆盖侧栏 3 项、消息 / 附件搜索和下载 8 项、筛选持久化 1 项、配置时区 1 项、真实通话组件 3 项及 Document PiP 2 项。
- 另两项官方加密流程最初因压缩生产包移除 `data-testid` 而超时，可访问性树中控件存在；改用官方 `CI_PACKAGE=1` 生产模式（保留测试标记、不压缩）的独立构建后，恢复密钥检查和数字身份重置 **2 项均通过**。未通过修改产品行为或删减测试来消除超时。
- E2E 使用独立临时静态服务与 Synapse 测试容器。CI 包位于 `/tmp/element-web-sync-2026-11-05-ci-webapp`，使用示例配置；实际部署配置未改动。
- `pnpm lint:js` 全仓通过；手工冲突处理文件的 Oxfmt 检查通过；`pnpm i18n` 通过且无额外译文差异；相对目标上游的空白及冲突标记检查通过。
- 查看了本次官方新增 / 修改的 **14 个 PNG** 前后对照，没有本地重生成基线。重置身份基线在 720px 视口底部截到继续按钮，经真实页面 trace 确认是可滚动设置区，滚动后按钮可达并成功完成重置；保留官方基线。地图新基线等待绘制完成，其他变化对应官方提示、标题色、图标、时间戳和状态菜单调整。

### 未覆盖范围

- 未运行全量 unit、全量 E2E、全量 lint、性能或覆盖率检查。E2E 使用 `--ignore-snapshots`，通过的是交互断言，不是 Docker 像素比较。
- 未连接实际自托管 Element Call 服务检查音视频收发和旧外部版本兼容性；通话 E2E 覆盖真实 React 组件挂载 / 主题 / tooltip，以及 mock 通话配合真实 Document PiP 窗口。
- 未验证 ChromeZoom 的精确缩放档位。搜索跳转 E2E 名称保留 StrictMode，但本次使用生产包；StrictMode effect replay 由搜索单测覆盖。
- 原有 React act、嵌套 button、旧 JSX transform 等测试警告仍存在。

## 完整官方提交清单

以下为 `git log 70e779c3c4..329b011e1e` 的全部 71 项原始提交标题：

```text
329b011e1e 2026-11-05 Fix maplibre screenshot test (#35705)
a3f5be54f4 2026-11-04 Update npm non-major dependencies (#35347)
d7e5329f14 2026-11-04 Fix missing icon in new room intro (#35695)
191b25790c 2026-11-04 Update react (#35532)
d2a564228b 2026-11-04 Check the recovery key without leaving the logout dialog (#35404)
acfbc32690 2026-11-04 Fix `New room` offered when lacking space permissions (#35692)
4fdfc61d1a 2026-11-04 Update browserslist (#35366)
2bde9ffad7 2026-11-04 Update oxc (#35682)
52219d90db 2026-11-04 Update github-actions non-major dependencies (#35663)
a32c1ca1f9 2026-11-04 Update actions/upload-artifact digest to cf430e0 (#35384)
2a37fcbe18 2026-11-04 Update dependency nx to v24 (#35677)
abf101ef1d 2026-11-04 Update dependency @peculiar/webcrypto to v2 (#35673)
aa99167651 2026-11-04 Update testcontainers docker digests (#35690)
4a8bd79aa9 2026-11-04 Add support for m.livekit (#35602)
412b431874 2026-11-04 [create-pull-request] automated change (#35691)
182b055df0 2026-11-03 Update electron-builder to v26.18.0 (#35671)
329f7ca748 2026-11-03 Update dependency vite to v8.3.5 (#35680)
817567eda4 2026-11-03 Update pnpm (#35687)
b691467973 2026-11-03 Update css (#35675)
3781a62c20 2026-11-03 Update dependency what-input to v6 (#35678)
d4f71bbfa0 2026-11-03 Update eslint-plugins (#35686)
ca58b7fbcf 2026-11-03 Update dnd-kit to v0.5.3 (#35685)
c7725eb665 2026-11-03 Update dependency chokidar to v6 (#35674)
6d6e0e12c6 2026-11-03 Update dependency @storybook/addon-designs to v12 (#35688)
d00ca8474e 2026-11-03 Update dependency typedoc-plugin-markdown to v4.14.1 (#35684)
cd46707194 2026-11-03 Add desktop config option to set hunspell dictionary download server (#35605)
c428598dcf 2026-11-03 Remove Python setup from macOS build workflow (#35654)
92185ba3d6 2026-11-03 Update mcr.microsoft.com/playwright:v1.64.1-jammy Docker digest to a3966b6 (#35657)
d85af5b5fa 2026-11-03 Fix Sign in with QR out of band confirmation logic (#35251)
7079d3ed61 2026-11-03 Update dependency stylelint-scss to v7.4.0 (#35681)
3b412a9105 2026-11-03 Update dependency happy-dom to v21.0.4 [SECURITY] (#35668)
9c7cfd7e37 2026-11-03 Update webpack (#35672)
1109d647d4 2026-11-03 Update Node.js to v26 (#35667)
192d898e26 2026-11-03 Update dependency electron to v44.10.1 (#35666)
282cfe8ee5 2026-11-03 Update docker/login-action digest to 81c6f93 (#35656)
867effd373 2026-11-03 Update alpine:3.24 Docker digest to be26560 (#35655)
3b4f6ce0ab 2026-11-03 Update tailscale/github-action digest to 064b105 (#35661)
2bfae8296f 2026-11-03 Update dependency @element-hq/element-call-embedded to v0.28.0 (#35665)
13faaf213b 2026-11-03 Update Node.js to c6ad9e9 (#35659)
c2a5b17e32 2026-11-03 Update rust:bookworm Docker digest to 9181b56 (#35660)
33ccd02522 2026-11-03 Fix timeline flaky test (#35653)
63663ec9ca 2026-11-03 Fix startup exit when migrating plaintext secrets on macOS and Windows (#35581)
21bec55846 2026-11-03 Bump shared-components to 0.2.3 (#35652)
e9a1a30e2b 2026-11-03 Fix user status being clipped by user menu (#35649)
fadb1d17b2 2026-11-03 Surface configured timezone in dropdown (#35650)
6b04987ab9 2026-11-03 Add ability to disable public rooms entirely via modules (#35641)
4a275df959 2026-11-03 Harden banner module (#35646)
e78584e7dd 2026-11-03 Fix "UIFeature.AllowCreatingPublic[Rooms|Spaces]" (#35591)
5d8742baec 2026-11-03 Update testcontainers docker digests (#35636)
3d60ffcfe7 2026-11-02 Fix header color in encryption tab (#35643)
0f85f27bc6 2026-11-02 Fix timestamp overlap on caption text in bubble layout (#35644)
b6324e2abe 2026-11-02 Assign new Playwright flake issues to the last contributor to change the test (#35638)
732f48cda8 2026-11-02 Tweak Can't confirm dialog to match designs exactly (#35574)
8f3aa27e7c 2026-11-02 Use the (now available) npm package for the element-call component (#35637)
ce6e35299c 2026-11-02 Update schedule for testcontainers-docker group (#35611)
d4c2e43db0 2026-11-02 Allow "userTimezone" to be configured via the config. (#35631)
e4f702c6f8 2026-11-02 Add a softer reset warning screen if the user has no encrypted chats (#35415)
ee5cac02f9 2026-11-02 Update dependency glob to v14 [SECURITY] (#35642)
375d58447e 2026-11-02 Document UIFeature.allowCreatingPublic[Rooms|Spaces] settings (#35612)
3ae06bae9c 2026-11-02 Update dnd-kit to v0.5.1 (#35531)
3111cd42be 2026-11-02 Persist active filter selection (#35420)
403b3190e2 2026-11-02 Update testcontainers docker digests (#35618)
ad7d5ec02b 2026-11-02 Fix type errors with shared-components (#35616)
ad69a7935e 2026-11-02 [create-pull-request] automated change (#35628)
a9cf6f38e4 2026-10-30 Update testcontainers docker digests (#35610)
547227b508 2026-10-30 Add a mechanism to bypass CLA (#35609)
57b8e2906e 2026-10-30 dont emptyOutDir in watch mode. this will log errors and break ui with (#35563)
06cdaa8e4f 2026-10-30 Update testcontainers docker digests (#35607)
557b6c9a4b 2026-10-30 Add lint rule to require test teardown (#35598)
3e7318c236 2026-10-30 Tweaks github actions workflows (#35604)
ac10d6ad90 2026-10-30 [create-pull-request] automated change (#35608)
```
