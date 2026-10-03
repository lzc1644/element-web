<!--
Copyright 2026 lzc1644

SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE in the repository root for full details.
-->

# 2026-10-04 上游同步记录

## 范围

- 分支：`develop`；同步前为 `2dda844d71`，保护分支为 `backup/develop-before-upstream-2026-10-04`。
- 官方来源：`https://github.com/element-hq/element-web.git`，已配置为 `upstream`。
- 目标：`upstream/develop` 的 `b2dd6d57e3525c670f9dc94c33e706b761ae182d`。
- 共同基线：`49d715c1e9`；共同基线后官方 62 个提交、本地 23 个提交。
- 使用合并而非变基，保留已有历史；不推送远端，不改动实际部署配置。

## 功能取舍

- **搜索保留**：浏览器 IndexedDB/Worker 索引、消息搜索、文件/媒体筛选、分页与历史回溯、编辑/撤回投影和下载入口没有对应的官方替代，本次继续保留。`apps/web/src/indexing/`、`search/`、`viewmodels/search/` 与同步前一致。
- **侧栏采用官方**：移除本地 68px 头像宽度模式、窄栏容器样式、头像角标位置和分隔条层级覆盖。侧栏、分隔条及共享房间列表相关源文件与目标上游一致；展开最小宽度为 200px，最大/默认宽度为 370px，保留官方完全折叠及点击/拖动展开行为。增加宽度配置回归断言。
- **通话采用官方新实现并保留自托管入口**：官方的通话参数计算、RTC API 更新、生命周期处理和可选 React 组件分支正常并入。iframe 分支仍按开发者地址、`element_call.url`、内置包的顺序选地址；外部地址使用 `/room` 路由，内置包使用目录地址。React 组件实验开关仍保持官方默认关闭，其分支不使用外部 iframe 地址。保留已有 hash 参数处理和旧通话终止事件权限，不额外重构通话职责。
- **官方文档预览及其他更新**：PDF/Markdown 查看器、线程活动面板、新时间线及依赖更新正常并入，不用旧组件覆盖官方新实现。

## 冲突与兼容处理

- `apps/web/@types/declaration.d.ts` 同时保留本地 Worker 所需的 WASM 声明和官方新增的普通 CSS 声明。
- `Call.ts` 合并自托管 URL 选择与官方 `computeCallOptions()`、`getTextParameters()`，覆盖地址优先级、带/不带末尾斜杠和官方参数的测试。
- 文件面板快照保留本地虚拟列表结构，按官方新增 serializer 去掉 CSS 类名 hash；检查后确认快照变化只有 hash 归一化。
- 修复自动合并没有报告的锁文件问题：Web workspace 的 `react-virtuoso` 改用上游已有的 `4.18.15` / React `19.3.0` 快照，没有重新解析或额外升级其他依赖。
- 浏览器索引测试的类型程序补入现有 app/SDK 全局声明。根据模块边界反馈，将 `Settings.test_setting` 扩展移到 `src/@types/settings-test.d.ts`，不再显式 include 无关的 `IncompatibleController.test.ts`；原测试移除重复声明。
- Playwright 新版本不再提供 `project.use.screen`，专用缩放 context 不复制该不存在的选项。
- 官方调整上传 context 的位置后，测试页面对象通过 Attachment 按钮和 file chooser 上传，不再假设隐藏 input 位于时间线容器内部；房间和线程上传均有 E2E 验证。
- 右侧面板的房间切换测试等待实际成员列表渲染，而非以一个可能尚未出现的 spinner 消失作为完成信号。

## 验证

- 采用仓库 `.node-version` 要求的 Node 24，`pnpm install --frozen-lockfile` 通过。系统 Node 22 缺少 TypeScript 支持；Corepack 的 pnpm 入口也有问题，验证使用 `/tmp/` 中的临时 Node/pnpm 启动工具，没有改项目版本配置或全局安装。
- `nx run-many -t test:unit:prepare -p`、`pnpm -r --workspace-concurrency=1 lint:types`、`nx run element-web:build` 通过。类型检查包括 Web 主程序、浏览器测试和 Playwright。
- Web 定向 Vitest：36 个文件 560 项通过；controller 类型声明拆分后另跑 1 个文件 7 项通过。
- shared-components：侧栏/分隔条/房间列表/共享搜索组件的 24 个文件 225 项通过。
- 真实 Chromium Worker：6 项通过；2 项可选性能基准未启用而跳过。单测与浏览器组件测试合计 **798 项通过**。
- Chrome 登录态 E2E：**13 项通过**。覆盖官方侧栏拖动与完全折叠/展开、空历史页后附件命中、真实消息搜索跳转、加密图片下载、隐藏/失败预览、长文件名、窄媒体面板、官方真实 React 通话组件挂载/主题和线程上传。
- E2E 使用本次生产包与本机 Synapse 容器。8080 已被其他项目的 Docker 服务占用，因此使用 `BASE_URL=http://127.0.0.1:18180`，未停止该服务；临时测试服务已停止。
- 执行 `pnpm i18n` 成功，生成译文与合并结果一致，无额外译文差异。修改文件的 Oxfmt / Oxlint、冲突标记检查和相对上游的差异空白检查通过。
- 上游导入的 PNG 基线与官方逐文件一致，已查看前后对照：主要变化为固定头像颜色、官方文案、线程活动面板、表情字体、PDF 工具栏和新增 Story 状态。没有本地重生成截图。完整合并差异中两处官方文本快照的末尾空格保留，不擅自改变快照里的文本。

## 验证边界

- 本次不是全量单元测试、全量 lint、全量 E2E 或覆盖率验收；生产构建仍有 8 条资源体积、CSS 和依赖警告。
- 本机 E2E 使用 `--ignore-snapshots`，通过的是交互断言，不是 Docker 环境的像素比较。
- 消息跳转用例虽沿用含 StrictMode 的名称，本次跑的是生产包，不以此声称验证了开发环境的 StrictMode 重放。
- 没有验证实际音视频收发、外部自托管通话服务器连接或专用 ChromeZoom 的精确缩放档位。此前搜索缩放截图的证据限制仍见 [搜索实现参考](search-implementation-reference.md)。
