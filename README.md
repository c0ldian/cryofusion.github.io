# 继保计算器（Relay Calculator）

面向继电保护现场整定与校验的前端工具集（Vue 3 + Vite）。当前项目为**纯前端**，支持多计算页面、左侧导航树切换、深色 Material 风格 UI，以及带负荷相角校验页面。

## 当前功能（与仓库一致）

- 首页工具卡片导航（`/#/`）
- 主变短路试验计算（`/#/calculators/short-circuit`）
- 短路电流计算（`/#/calculators/short-circuit-current`）
- 距离保护（总览+分页面）
  - `/#/calculators/distance`
  - `/#/calculators/distance/phase`
  - `/#/calculators/distance/directional`
- 差动保护（`/#/calculators/differential`）
- 过流保护（`/#/calculators/over-current`）
- CT 变比（`/#/calculators/ct-ratio`）
- PT 变比（`/#/calculators/pt-ratio`）
- 重合闸时间（`/#/calculators/reclose-time`）
- 灵敏度校验（`/#/calculators/sensitivity`）
- 带负荷相角校验（`/#/calculators/load-angle-verification`）
  - 三相 U/I 幅值与相角输入
  - 钳表方向修正（正向/反向）
  - 参考相量对比、相角偏差判断、诊断建议
  - SVG 相量图（实测/参考）
  - 试验记录复制

> 路由以 `hash` 模式运行（`createWebHashHistory`）。

## UI / 导航现状

- 全局左侧为**分组导航树**（Material 风格）
- 移动端为抽屉菜单，桌面端固定侧栏
- 全局深色主题 + 渐变背景 + 统一字体（Inter / Noto Sans SC）

## 技术栈

- Vue 3
- Vue Router 4
- Pinia 3
- Vite 7
- Tailwind CSS 4
- ECharts 6（部分图表页面）
- KaTeX（公式渲染）

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址：`http://localhost:5173`（具体端口以终端输出为准）。

## 构建

```bash
npm run build
```

产物目录：`dist/`

## 项目结构（当前）

```text
src/
├── App.vue                          # 全局壳层、导航树、路由容器
├── main.js
├── router/
│   └── index.js                     # 页面路由注册
├── pages/
│   ├── HomeNew.vue
│   ├── ShortCircuitTestNew.vue
│   ├── ShortCircuitCurrent.vue
│   ├── Differential.vue
│   ├── OverCurrent.vue
│   ├── CtRatio.vue
│   ├── PtRatio.vue
│   ├── RecloseTime.vue
│   ├── Sensitivity.vue
│   ├── LoadAngleVerification.vue
│   └── distance/
├── design-system/                   # Button/Input/Card/Alert 等
├── calc/                            # 算法引擎（差动/距离等）
├── components/
├── store/
└── utils/
```

## 说明

- 本项目仍在持续迭代中，页面和计算逻辑可能继续调整。
- 当前仓库未提供 `npm test` / `npm run lint` 脚本；主要使用 `npm run build` 做构建校验。
- 计算结果用于工程辅助，请结合现场规程与装置说明书复核。
