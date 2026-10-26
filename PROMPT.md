# 数据看板实现提示词（Prompt）

> 用途：把下面这段提示词直接交给 AI（或作为作业说明），即可复现本项目。
> 本项目实际交付物：`index.html` + `assets/styles.css` + `assets/app.js`（无构建、无依赖），
> 外加自检页 `tools/device-check.html` 与预览图 `preview/`。

---

## 一、可直接复用的 Prompt（复制整段）

```text
你是一名资深前端工程师。请用 HTML + CSS + 原生 JavaScript（禁止 React/Vue/Tailwind/任何第三方库、
禁止构建工具）实现一个「运营数据看板」单页，要求能在手机、平板、桌面三档宽度下都正常使用。

【一、三档断点，必须明确实现，不允许只写一套样式靠缩放硬撑】
1. 手机  < 768px   ：单列堆叠；侧边栏不渲染；顶部用胶囊按钮（<button>）做模块切换。
2. 平板  768–1199px：指标卡两列、图表区两列；侧边栏仍不渲染。
3. 桌面  ≥ 1200px  ：左侧固定侧边栏（sticky，高度撑满视口） + 指标卡四列 + 图表区主次两列。
断点必须用 CSS 原生 @media (min-width: 768px) / (min-width: 1200px) 显式书写，并在注释里标注档位。

【二、布局硬性约束】
- 卡片区必须使用 grid 的 auto-fit / minmax()（或 flex-wrap），绝对不允许写死 width: 1200px
  之类的大固定宽度，也不允许用 transform: scale 缩放整页。
- 所有 grid 子项写 minmax(0, 1fr)，避免长内容把网格撑破。
- 页面在 320px ~ 1920px 全区间都不允许出现横向滚动条（纵向滚动正常）。
- 容器最大宽度 1680px，水平居中；内边距用 clamp() 随视口变化。

【三、数据渲染】
- 看板里「6 条渠道数据」必须由 JS 数组驱动：一个数组 → map 生成模板字符串 → innerHTML 渲染，
  严禁手写 6 段重复 HTML。
- 4 张核心指标卡、7 日柱状图、环形占比图也必须来自同一份数据源，页面里不放任何硬编码业务数字。
- 提供「刷新数据」按钮：点击后抖动数据并整体重渲染（用来验证数字不跳动）。
- 数字格式化使用 Intl.NumberFormat('zh-CN')；大数字标签压缩成 12.4k 之类的紧凑写法。

【四、数字稳定性】
- 所有数值元素使用 font-variant-numeric: tabular-nums（配合 font-feature-settings: "tnum"），
  保证刷新数据时数字宽度恒定、版面不抖动。

【五、主题与颜色】
- 所有颜色、圆角、间距统一由 CSS 变量（:root 里定义）管理，组件里不出现裸色值。
- 实现深色 / 浅色两套主题：html[data-theme="dark"] 覆盖变量；
  右上角用 <button> 切换，状态写入 localStorage，首次访问跟随 prefers-color-scheme。
- 图表色板（--c1…--c6）也要跟着主题变化，深色下提亮。

【六、图标与图片】
- 所有图标用内联 SVG，stroke/fill 为 currentColor，随文字色/主题变化；
- 每个 svg 必须显式给出 width、height 和 viewBox，不允许用图片文件、不允许 emoji 顶替图标。

【七、语义化与可访问性】
- 页面标题用 h1，每个区块标题用 h2；卡片区/图表区用 <section> 包裹，并用 aria-labelledby 关联标题。
- 所有可点击控件用 <button>（主题切换、刷新、模块切换），不允许用 div 加 onclick。
- 补充：<html lang="zh-CN">、跳到主内容链接、:focus-visible 焦点环、
  图表用 role="img" + aria-label 描述数据、装饰性图标 aria-hidden="true"。

【八、视觉要求（不要做成"作业味的灰盒子"）】
- 浅色：浅灰蓝底 + 微光晕渐变背景；卡片纯白、1px 描边、极轻投影、16px 圆角。
- 深色：近黑蓝底、深色卡片、亮蓝强调色，文字对比度足够。
- 指标卡结构：图标 + 环比涨跌胶囊 → 指标名 → 大数字 → 迷你折线（描边 + 12% 透明度面积）。
- 柱状图：纯 CSS + JS 计算高度百分比，横向网格线用 background linear-gradient 模拟；
  最高值柱用强调色区分；柱顶显示紧凑数值标签。
- 环形图：conic-gradient 由 JS 拼色段 + 中心挖空显示总量，右侧配图例。
- 明细行：图标 + 名称/说明 + 访问/转化 + 转化率进度条 + 7 日迷你折线（窄屏隐藏折线、改两行排布）。
- 交互克制：hover 只做轻微颜色/亮度变化，过渡 0.18–0.55s；遵循 prefers-reduced-motion。

【九、交付物】
- index.html、assets/styles.css、assets/app.js 三个文件，双击 index.html 即可运行（file:// 可用）；
- 不需要构建、不需要服务器、不需要任何 CDN 资源；
- CSS 顶部写清分区注释（令牌 / 重置 / 布局 / 组件 / 断点）；JS 按「工具 → 数据 → 渲染 → 交互 → 启动」分区。

【十、自检清单（提交前逐条确认）】
□ 320 / 375 / 414 / 768 / 834 / 1024 / 1200 / 1440 / 1920 宽度下 documentElement.scrollWidth <= clientWidth
□ 三档断点下侧栏、列数、明细行排布均按规则变化
□ 页面 HTML 里搜不到重复的 6 段渠道结构，数据全在 JS 数组里
□ 刷新数据时数字不左右跳动（tabular-nums 生效）
□ 深浅色切换后所有区域（含图表、进度条、图例）都正确换色、无死白/死黑块
□ 键盘 Tab 能依次遍历所有按钮且焦点可见
□ 控制台无报错、无 404
```

---

## 二、本项目的数据结构（实现时的关键约定）

```js
// 指标卡
{ id, label, value, format: 'int' | 'percent' | 'money', unit, delta, icon, spark: number[] }

// 趋势（7 天）
{ label: '周一', value: 12460 }

// 渠道明细（6 条 → 6 行）
{ name, note, icon, visits, conv, trend: number[7] }

// 派生指标：转化率 = conv / visits * 100（不冗余存储，避免数据不一致）
```

渲染函数职责单一：

| 函数 | 输出 |
| --- | --- |
| `renderKpis()` | 4 张指标卡（含迷你折线） |
| `renderTrend()` | 柱状图 + x 轴标签 + 动态 aria-label |
| `renderShare()` | `conic-gradient` 环形图 + 图例百分比 |
| `renderChannels()` | 6 行渠道明细，带宽高比例条与迷你折线 |
| `sparkline(values, opts)` | 通用迷你折线 generator（KPI 与明细行复用） |

---

## 三、断点实现位置（代码索引）

| 位置 | 内容 |
| --- | --- |
| `styles.css` → `.app` | 基础单列 `grid-template-columns: minmax(0, 1fr)` |
| `styles.css` → `@media (min-width: 768px)` | 指标卡两列、图表两列、明细行四栏（含折线） |
| `styles.css` → `@media (min-width: 1200px)` | 246px 侧栏 + 内容区、指标卡四列、图表 1.55fr/1fr |
| `styles.css` → `@media (min-width: 1600px)` | 超大屏放大数字与图表高度 |
| `styles.css` → `@media (max-width: 380px)` | 极窄屏收紧内边距与环形图尺寸，杜绝溢出 |
| `styles.css` → `.kpi-grid` | `repeat(auto-fit, minmax(min(100%, 220px), 1fr))` 作为自适应兜底 |

---

## 四、本地运行

```bash
# 方式一：直接双击 index.html（能用，但手机上不方便验证）
# 方式二（推荐）：起本地服务，手机同 WiFi 直接访问
cd D:\blueCode\html-plantform
python -m http.server 8080
# 电脑：http://localhost:8080
# 手机：http://<本机局域网IP>:8080   （ipconfig 查 WLAN 的 IPv4）
```

---

## 五、怎么验证「手机 / 平板能正常用」

### 方式 A：真机（最有说服力）

1. 电脑起服务：`python -m http.server 8080`（必须用 http，`file://` 在手机上会触发权限/跨域问题）。
2. 电脑 `ipconfig` 查 WLAN 的 IPv4（本次为 `10.44.137.166`），手机连同一 WiFi。
3. 手机浏览器打开 `http://10.44.137.166:8080`，或自检页 `http://10.44.137.166:8080/tools/device-check.html`。
4. 横竖屏各看一遍，重点看三处：指标卡列数、图表是否挤、明细行是否换行正确。

### 方式 B：Chrome DevTools 设备模式（最快，随时可复用）

`F12` → 左上角设备图标（Ctrl+Shift+M）→ 依次选 iPhone SE (375)、iPhone 14 Pro Max (430)、
iPad mini (768)、iPad Pro (1024)，再拖到 1200/1440。每档只做三件事：

1. 看底部有没有**横向滚动条**（或控制台跑 `document.documentElement.scrollWidth > document.documentElement.clientWidth`，必须 false）；
2. 数**指标卡每行几张**：<768 应为 1 张，768–1199 为 2 张，≥1200 为 4 张且左侧出现侧栏；
3. 点右上角主题按钮、点「刷新数据」，看数字换值时**卡片不左右跳**。

### 方式 C：一键自检页（已内置）

打开 `tools/device-check.html`：

- 顶部实时显示当前视口、DPR、命中断点、**横向滚动条状态**（手机上打开本页 = 真机检测）；
- 点「开始测量」自动跑 15 档宽度（320→1920），逐行比对「指标卡每行数量 / 侧栏有无 / scrollWidth vs clientWidth」，全绿即通过；
- 底部有触控反馈区与「内部横向滚动」测试条。

实测结果（15 档全部 PASS）：

```
320px 1/期望1 无侧栏 320/320 PASS    768px 2/期望2 无侧栏 768/768 PASS
360px 1/期望1 无侧栏 360/360 PASS    834px 2/期望2 无侧栏 834/834 PASS
375px 1/期望1 无侧栏 375/375 PASS   1024px 2/期望2 无侧栏 1024/1024 PASS
414px 1/期望1 无侧栏 414/414 PASS   1100px 2/期望2 无侧栏 1100/1100 PASS
480px 1/期望1 无侧栏 480/480 PASS   1200px 4/期望4 有侧栏 1200/1200 PASS
600px 1/期望1 无侧栏 600/600 PASS   1440px 4/期望4 有侧栏 1440/1440 PASS
                                    1920px 4/期望4 有侧栏 1920/1920 PASS
```

### 真机手测清单（3 分钟）

- [ ] 竖屏首屏不需要左右拖动就能看全内容
- [ ] 切横屏后卡片自动变成两列/四列，文字不挤成一列字
- [ ] 双指缩放后文字不溢出卡片（`viewport` 未禁用缩放，可正常放大）
- [ ] 手指滑动只上下滚，页面不左右晃
- [ ] 明细行的迷你折线在窄屏被隐藏、转化率进度条仍可读
- [ ] 深/浅色切换后刷新页面，主题保持（localStorage 生效）
- [ ] 点击「刷新数据」时数字宽度不变，卡片不抖动

---

## 六、验收记录（浏览器实测）

**① 断点与列数**（无头 Chrome 实测，`scrollWidth` vs `clientWidth`）

| 视口 | scrollWidth / clientWidth | 横向滚动 | 指标卡每行 | 侧栏 |
| --- | --- | --- | --- | --- |
| 320 | 305 / 305 | 无 | 1 | 无 |
| 360 | 345 / 345 | 无 | 1 | 无 |
| 375 | 360 / 360 | 无 | 1 | 无 |
| 414 | 399 / 399 | 无 | 1 | 无 |
| 480 | 465 / 465 | 无 | 1 | 无 |
| 600 | 585 / 585 | 无 | 1 | 无 |
| 768 | 753 / 753 | 无 | 2 | 无 |
| 834 | 819 / 819 | 无 | 2 | 无 |
| 1024 | 1009 / 1009 | 无 | 2 | 无 |
| 1100 | 1085 / 1085 | 无 | 2 | 无 |
| 1200 | 1185 / 1185 | 无 | 4 | 有 |
| 1366 / 1440 / 1680 / 1920 | 全部相等 | 无 | 4 | 有 |

**② 行为自检（23 项全部通过）**

- 主题切换：`data-theme` light → dark，`aria-pressed` 同步，body 背景 `rgb(238,242,249)` → `rgb(8,13,25)`
- 刷新数据：数值从 `18,420` → `19,202`，同时 `.kpi__value` 盒宽 `166.75px → 166.75px`（tabular-nums 生效，无抖动）
- 结构计数：指标卡 4 / 渠道行 6 / 柱子 7 / 图例 6 / 迷你折线 6 / 环形图 conic-gradient 已注入
- 语义：h1×1、h2×4、section×4、button×6，无内联 onclick
- 图标：34 个内联 SVG，全部带 width/height
- 胶囊切换、键盘焦点环、`prefers-reduced-motion` 均已覆盖

**③ 三档预览图**：`preview/desktop-1440.png`、`preview/desktop-1440-dark.png`、`preview/responsive-320-768.png`
