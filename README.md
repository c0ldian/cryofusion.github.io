# 继保计算器（Relay Calculator）

> 完整的在线继电保护校验工具集｜基于专家手册的精确算法｜专为变电二次工程师打造

[![Vue 3](https://img.shields.io/badge/Vue-3.5-green)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38bdf8)](https://tailwindcss.com/)

---

## 📖 目录

- [项目简介](#项目简介)
- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
  - [开发环境](#开发环境)
  - [生产构建](#生产构建)
  - [部署](#部署)
- [功能详解](#功能详解)
  - [主变差动保护校验](#主变差动保护校验)
  - [主变短路试验计算](#主变短路试验计算)
  - [短路电流计算](#短路电流计算)
  - [距离保护阻抗圆](#距离保护阻抗圆)
  - [过流保护整定计算](#过流保护整定计算)
  - [灵敏度校验](#灵敏度校验)
- [算法原理](#算法原理)
- [开发规范](#开发规范)
- [维护日志](#维护日志)
- [版本历史](#版本历史)
- [联系与支持](#联系与支持)

---

## 项目简介

**继保计算器** 是面向变电二次专业工程技术人员的在线计算工具，旨在提供准确、高效的继电保护整定计算与现场校验方案生成。

本项目的设计原则：

- **严格遵循专家手册**：所有算法均以行业标准校验规程为基准，不做简化除非有明确依据
- **工程实用性优先**：计算结果是完整的调试方案，包括接线指导、相角设置、注意事项
- **代码干净可维护**：核心算法独立于 UI，便于单元测试和公式验证
- **本地运行，无需后端**：纯前端实现，在浏览器中完成全部计算，数据不上传

**当前版本**：v0.1.0-alpha  
**部署地址**：https://meiqiuclaw.github.io  
**源码仓库**：https://github.com/meiqiuclaw/relay-calculator

---

## 核心功能

| 功能模块 | 描述 | 状态 |
|---------|------|------|
| 主变差动保护校验 | 支持任意 YNd/YNy/Yy 组别，自动补偿角差，生成斜率扫描测试序列 | ✅ |
| 主变短路试验计算 | 计算试验电流/电压，生成试验接线方案 | ✅ |
| 短路电流计算 | 系统-主变-线路串联阻抗，一键计算故障电流 | ✅ |
| 距离保护阻抗圆 | 计算动作阻抗、偏移量，辅助整定 | ✅ |
| 过流保护整定计算 | 负荷电流法计算启动电流，生成现场校验模板 | ✅ |
| 灵敏度校验 | 最小短路电流校验，确保保护范围覆盖 | 🚧 |

---

## 技术栈

- **框架**：Vue 3.5 + Composition API
- **构建工具**：Vite 7
- **样式**：Tailwind CSS 4（深色主题）
- **图表**：ECharts 6（差动特性曲线可视化）
- **公式渲染**：KaTeX 0.16（数学公式即时显示）
- **状态管理**：Pinia 3（变压器参数共享）
- **路由**：Vue Router 4
- **代码质量**：ESLint + Prettier（待配置）

---

## 快速开始

### 开发环境

1. **克隆仓库**

```bash
git clone https://github.com/meiqiuclaw/relay-calculator.git
cd relay-calculator
```

2. **安装依赖**

```bash
npm install
```

3. **启动开发服务器**

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`（端口可能不同）

### 生产构建

```bash
npm run build
```

构建输出到 `dist/` 目录（默认使用相对路径，适合 GitHub Pages）

### 部署

#### GitHub Pages（推荐）

1. 在 GitHub 仓库设置中启用 Pages，源分支选 `gh-pages` 或 `main` 的 `dist/` 文件夹
2. 首次部署建议使用 `vite.config.js` 中的相对路径配置：

```js
export default defineConfig({
  base: './', // 确保在 GitHub Pages 下路径正确
  // ...
})
```

3. 构建后推送：

```bash
npm run build
git add dist && git commit -m 'deploy v0.1.0'
git push origin main
# 或使用 gh-pages 分支
```

#### 自建服务器

将 `dist/` 内容复制到 Nginx/Apache 静态目录即可，无需后端。

---

## 功能详解

### 主变差动保护校验

**路径**：`/differential`

**输入参数**：

| 参数 | 说明 | 示例 |
|------|------|------|
| 容量 (Sn_MVA) | 变压器额定容量 | 50 |
| 高压侧电压 (UH_kV) | 高压侧额定电压 | 110 |
| 低压侧电压 (UL_kV) | 低压侧额定电压 | 10.5 |
| 接线组别 (groupStr) | YNd11 / YNy0 等下拉选择 | YNd11 |
| 高压侧 CT 变比 (nCTH_str) | 格式 `600/5` | 600/5 |
| 低压侧 CT 变比 (nCTL_str) | 格式 `4000/5` | 4000/5 |
| 软件补偿方向 (compDir) | H=高压侧补偿，L=低压侧补偿 | H |
| 装置 CT 配置 (deviceConfig) | delta-to-wye / wye-to-delta | delta-to-wye |
| 制动电流定义 (Ir_mode) | avg（求和型）或 max（最大值型） | avg |
| 最小动作电流 Id_min | 差动保护最小动作电流（标幺值） | 0.5 |
| 制动系数 K1 / K2 | 比率制动斜率参数 | 0.5 / 0.5 |
| 拐点电流 Ir_break | 制动斜率切换点（标幺值） | 2.0 |

**输出结果**：

- 斜率扫描点表格：每个 Ir 对应的 Id_boundary 和详细注入量（高压/低压侧各相幅值、相角）
- 完全可复制的现场调试方案（点击"复制完整方案"）
- 接线指导（依据 ctChannels 配置）
- 相角设置详解（考虑组别角差和补偿方向）

**计算核心**：`src/calc/differentialEngine.js`

**关键算法**：

1. 额定电流计算（二次侧）
2. 组别角差补偿矩阵（`getCompensationMatrix`）
3. 单相/三相注入量计算（穿越特性）
4. 动作边界 `Id_thr = Id_min + K1·Ir + K2·(Ir-Ir_break)`

**注意事项**：

- `compDir` 必须与保护装置软件设置严格一致，否则相角全错
- YNd11 组别角差 30°，补偿方向常用 H（高压侧补偿）
- 注入模式选三相平衡时，自动生成 ABC 三相幅值/相角；单相模式仅 A 相加量，适用于 3 路测试仪

---

### 主变短路试验计算

**路径**：`/short-circuit-test`

**输入参数**：

| 参数 | 说明 |
|------|------|
| 容量 (Sn_MVA) | 主变额定容量 |
| 高压侧电压 (UH_kV) | 高压侧额定电压 |
| 低压侧电压 (UL_kV) | 低压侧额定电压 |
| 高压侧 CT 变比 | 如 `600/5` |
| 低压侧 CT 变比 | 如 `4000/5` |
| PT 变比 | 如 `1000/100`，用于计算保护二次电压 |
| 短路阻抗 (%) | 短路试验实测阻抗，如 13.92% |
| 试验电压 (kV) | 高压侧通入的一次电压，如 3.0 kV |

**计算步骤**：

1. 高压侧一次额定电流 `I_H_1st = S / (√3 × U_H)`
2. 高压侧试验一次电流 `I_H_test_1st = I_H_1st / Zk% × (U_test / U_H)`
3. 高压侧二次电流 `I_H_test_2nd = I_H_test_1st / nCTH`
4. 保护二次电压 `U_H_test_2nd = U_test / nPT`
5. 低压侧一次电流 `I_L_test_1st = I_H_test_1st × (U_H / U_L)`
6. 低压侧二次电流 `I_L_test_2nd = I_L_test_1st / nCTL`

**输出**：包含精确数值、试验接线说明的可复制方案。

---

### 短路电流计算

**路径**：`/short-circuit-current`

**输入参数**：

| 参数 | 说明 |
|------|------|
| 系统短路容量 (MVA) | 母线短路容量，用于计算系统阻抗 |
| 系统额定电压 (kV) | 系统基准电压 |
| 主变短路阻抗 (%) | 主变阻抗百分数 |
| 线路单位阻抗 R (Ω/km) | 线路正序电阻 |
| 线路单位阻抗 X (Ω/km) | 线路正序电抗 |
| 线路长度 (km) | 故障点到测量点的距离 |
| 故障类型 | 三相/两相/单相 |
| 故障点距首端距离 (km) | 参与阻抗计算，应与线路长度一致 |

**计算公式**：

```
Z_sys = U² / S_sc
Z_tr = (U / (√3 × I_n)) × (Zk% / 100)
Z_line = (R + jX) × L
I_sc = U / (√3 × Z_total)
```

**注意**：二次电流按预设 CT 变比（600/5=120）估算，实际请修改代码或未来增加输入字段。

---

### 距离保护阻抗圆

**路径**：`/distance`

**输入**：

- 整定阻抗 Z_n (Ω)
- 线路阻抗 Z_line (Ω)

**输出**：

- 动作阻抗 reach = Z_line
- 偏移量 offset = |Z_n - Z_line|

**原理**：距离保护动作条件为测量阻抗 ≤ 整定阻抗。此模块仅提供简单金属性故障的阻抗值。

---

### 过流保护整定计算

**路径**：`/over-current`

**输入**：

- 负荷电流 (A)
- 可靠系数 K_rel
- 返回系数 K_re

**计算公式**：

```
I_op = K_rel × K_re × I_load
```

**校验参数配置**（用于生成现场记录）：

- 不动作系数（默认 0.95）
- 动作系数（默认 1.00）
- 超动系数（默认 1.05）
- 加量保持时间（秒）
- 方向过流选项（如启用，可配置反向不动作系数和时间）

点击"复制校验模板"生成完整的现场记录文档。

---

### 灵敏度校验

**路径**：`/sensitivity`

妈呀这个模块还没写完，TODO。

---

## 算法原理

### 差动保护核心（`differentialEngine.js`）

1. **额定电流**

$$
I_{2\text{nd}} = \frac{S}{\sqrt{3} \times U} \div n_{\text{CT}}
$$

2. **穿越电流与制动电流**

- 穿越电流 $I_d = |I_H - I_L|$
- 制动电流 $I_r = (|I_H| + |I_L|) / 2 \quad (\text{avg模式})$
- 动作边界：$I_{d,\text{th}} = I_{d,\text{min}} + K_1 \cdot I_r$ （$I_r \le I_{r,\text{break}}$）

3. **补偿矩阵**

对于组别 G（如 YNd11，G=11），低压侧超前高压侧 $30^\circ \times G$。

补偿方向 `compDir='H'`（高压侧补偿，角转星）：

$$
M = \frac{1}{\sqrt{3}} e^{-j\theta_G} \times
\begin{bmatrix}
1 & -1 & 0 \\
0 & 1 & -1 \\
-1 & 0 & 1
\end{bmatrix}
$$

`compDir='L'` 角度相反。

4. **注入量计算**

- 单相平衡：仅 A 相注入
- 三相平衡：高压侧 ABC 对称，低压侧相位偏移 $180^\circ$（穿越方向）

**重要**：测试仪调相角度务必按页面指引设置。

---

## 开发规范

### 文件结构

```
src/
├── pages/              # 页面组件（对应路由）
│   ├── Differential.vue
│   ├── ShortCircuitTest.vue
│   ├── ShortCircuitCurrent.vue
│   ├── Distance.vue
│   ├── OverCurrent.vue
│   └── Sensitivity.vue (TODO)
├── components/         # 通用组件
│   ├── Layout.vue
│   ├── KaTeX.vue
│   └── DiffChart.vue   # 差动特性曲线 ECharts
├── calc/               # 纯算法模块（独立无依赖）
│   ├── differentialEngine.js
│   ├── vectorMath.js
│   ├── transformerModel.js
│   ├── ctModel.js
│   ├── characteristicEngine.js
│   ├── testGenerator.js
│   ├── distanceEngine.js
│   └── overCurrentEngine.js (TODO)
├── composables/        # Vue 组合式函数
│   └── useKatex.js
├── utils/              # 工具函数
│   ├── unitConverter.js
│   └── balanceCalculator.js
├── store/              # Pinia store（待规范化）
│   └── transformerStore.js
├── main.js
└── App.vue
```

### 新增页面指南

1. **算法分离**：在 `src/calc/` 下创建独立算法模块，**不依赖 Vue 组件**，导出纯函数
2. **页面组件**：使用 `<script setup>`，尽量保持模板简洁，计算逻辑移至 `computed`
3. **错误处理**：所有用户输入必须验证，错误统一显示在页面顶部
4. **复制功能**：使用 `navigator.clipboard` 并提供 fallback 提示
5. **公式**：使用 KaTeX 组件，复杂公式写在单独的行里
6. **样式**：使用 Tailwind，深色主题颜色类：`bg-gray-900`、`text-gray-100`、`border-gray-700`

### 版本与更新

每次新增功能或修改算法后：

1. 更新本文档的"功能详解"和"维护日志"
2. 在 `MEMORY.md` 中记录重大变更（仅主会话）
3. Git 提交使用语义化前缀：`feat:`, `fix:`, `docs:`, `refactor:`, `test:`

---

## 维护日志

### 2026-02-27 — README 文档完整化

- 撰写完整 README.md，包含所有功能说明、算法原理、开发规范
- 明确要求：以后每提出新需求都更新本文档

### 2026-02-26 — KaTeX 与 bug 修复

- 集成 KaTeX 渲染数学公式
- 修复 `Complex.arg()` 缺失导致相位计算错误
- 修复 `ct_channels` 变量名不匹配问题
- 移除 Discord 代理配置，Gateway 恢复正常
- 测试通过：差动页面自动生成序列与校验功能

### 2026-02-25 — 项目初始化

- 搭建 Vue 3 + Vite + Tailwind 基础框架
- 完成差动保护核心算法，支持 YNd 组别补偿
- 实现短路试验与短路电流模块
- 部署至 GitHub Pages (`meiqiuclaw.github.io`)

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1.0-alpha | 2026-02-25 | 首次公开部署，包含差动保护、短路试验、短路电流计算 |
| v0.1.1-alpha | 2026-02-26 | 增加 KaTeX 公式支持，修复复数相位错误 |
| v0.1.2-alpha | 2026-02-27 | 完善文档，规范开发流程 |

---

## 联系与支持

- 开发者：`煤球` & `c0ldian`（Yan）
- 问题反馈：https://github.com/meiqiuclaw/relay-calculator/issues
- 技术讨论：Discord/Signal（通过 OpenClaw）

**记住**：计算结果仅供参考，现场校验请以实际设备为准。复杂接线或特殊保护原理需二次确认。

---

*最后更新：2026-02-27 08:00 Asia/Shanghai*  
*文档维护责任：主会话（USER.md: Yan）*
