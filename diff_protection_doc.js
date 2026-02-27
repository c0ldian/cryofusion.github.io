const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, TabStopType, TabStopPosition,
  VerticalAlign
} = require('docx');
const fs = require('fs');

// ─── Color Palette ───────────────────────────────────────────────
const C = {
  blue:      "1F4E79",
  lightBlue: "2E75B6",
  skyBlue:   "D6E4F0",
  midBlue:   "BDD7EE",
  darkGray:  "404040",
  midGray:   "7F7F7F",
  white:     "FFFFFF",
  yellow:    "FFF2CC",
  green:     "E2EFDA",
  orange:    "FCE4D6",
  red:       "C00000",
};

// ─── Helpers ─────────────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const borders = { top: border, bottom: border, left: border, right: border };
const thickBorder = { style: BorderStyle.SINGLE, size: 4, color: C.lightBlue };
const thickBorders = { top: thickBorder, bottom: thickBorder, left: thickBorder, right: thickBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: C.white, size: 32, font: "Arial" })],
    shading: { fill: C.blue, type: ShadingType.CLEAR },
    spacing: { before: 360, after: 160 },
    indent: { left: 200, right: 200 },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, color: C.white, size: 26, font: "Arial" })],
    shading: { fill: C.lightBlue, type: ShadingType.CLEAR },
    spacing: { before: 280, after: 120 },
    indent: { left: 160 },
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, color: C.blue, size: 24, font: "Arial" })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.lightBlue } },
    spacing: { before: 220, after: 100 },
  });
}

function para(runs, opts = {}) {
  const children = typeof runs === 'string'
    ? [new TextRun({ text: runs, font: "Arial", size: 22, color: C.darkGray })]
    : runs;
  return new Paragraph({ children, spacing: { before: 60, after: 60 }, ...opts });
}

function txt(text, opts = {}) {
  return new TextRun({ text, font: "Arial", size: 22, color: C.darkGray, ...opts });
}

function bold(text, color = C.blue) {
  return new TextRun({ text, font: "Arial", size: 22, bold: true, color });
}

function code(text) {
  return new TextRun({ text, font: "Courier New", size: 19, color: "7B2C8B", highlight: "yellow" });
}

function codeBlock(lines) {
  return lines.map((line, i) => new Paragraph({
    children: [new TextRun({ text: line, font: "Courier New", size: 19, color: "2B2B2B" })],
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    border: i === 0 ? { top: { style: BorderStyle.SINGLE, size: 4, color: C.midGray } } :
            i === lines.length - 1 ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.midGray } } : {},
    indent: { left: 400, right: 400 },
    spacing: { before: 30, after: 30 },
  }));
}

function noteBox(label, text, fillColor = C.yellow) {
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [700, 8300],
    rows: [new TableRow({ children: [
      new TableCell({
        borders, shading: { fill: C.lightBlue, type: ShadingType.CLEAR },
        width: { size: 700, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, bold: true, color: C.white, font: "Arial", size: 22 })] })]
      }),
      new TableCell({
        borders, shading: { fill: fillColor, type: ShadingType.CLEAR },
        width: { size: 8300, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 160, right: 120 },
        children: [para(text)]
      }),
    ]})],
  });
}

function headerRow(cells, widths, fillColor = C.midBlue) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((c, i) => new TableCell({
      borders, shading: { fill: fillColor, type: ShadingType.CLEAR },
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: c, bold: true, font: "Arial", size: 21, color: C.blue })] })],
    }))
  });
}

function dataRow(cells, widths, shade = C.white) {
  return new TableRow({
    children: cells.map((c, i) => new TableCell({
      borders, shading: { fill: shade, type: ShadingType.CLEAR },
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: c, font: "Arial", size: 20, color: C.darkGray })] })],
    }))
  });
}

function spacer(n = 1) {
  return Array(n).fill(new Paragraph({ children: [txt("")], spacing: { before: 60, after: 60 } }));
}

function divider() {
  return new Paragraph({
    children: [txt("")],
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: C.lightBlue } },
    spacing: { before: 120, after: 120 },
  });
}

// ─── Build Document ───────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "-",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    children: [

      // ── 封面 ──────────────────────────────────────────────────────
      new Paragraph({ children: [txt("")], spacing: { before: 800, after: 0 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: C.blue, type: ShadingType.CLEAR },
        spacing: { before: 0, after: 0 },
        indent: { left: 0, right: 0 },
        children: [new TextRun({ text: "主变差动保护校验", bold: true, size: 56, font: "Arial", color: C.white, break: 1 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: C.lightBlue, type: ShadingType.CLEAR },
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "核心算法与继保测试仪接线指导手册", size: 32, font: "Arial", color: C.white, break: 1 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: C.skyBlue, type: ShadingType.CLEAR },
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "适用范围：YNd/YNy/Yd 各组别变压器  |  二绕组/三绕组  |  软件补偿 & 硬件补偿", size: 22, font: "Arial", color: C.blue })],
      }),
      new Paragraph({ children: [txt("")], spacing: { before: 600, after: 0 } }),

      // 模块说明框
      new Table({
        width: { size: 9740, type: WidthType.DXA },
        columnWidths: [9740],
        rows: [new TableRow({ children: [new TableCell({
          borders: thickBorders,
          shading: { fill: C.skyBlue, type: ShadingType.CLEAR },
          margins: { top: 200, bottom: 200, left: 300, right: 300 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "本文档供 AI 编程助手阅读学习，包含：", bold: true, font: "Arial", size: 24, color: C.blue })] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("所有 YNd1 ~ YNd11 变压器组别的角差补偿矩阵（软件方式）")] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("内部软件补偿两种方向：角转星(高压侧Delta补偿)与星转角(低压侧Y补偿)")] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("比率制动斜率校验：单相平衡接线与三相平衡接线两种模式")] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("三路电流输出与六路电流输出两类继保仪的接线方案与注入量计算")] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("完整 Python 伪代码结构，含输入输出数据字典定义")] }),
          ]
        })] })] }),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 第一章
      // ══════════════════════════════════════════════════════════════
      h1("第一章  差动保护基本原理与关键参数"),

      h2("1.1  比率制动差动保护动作方程"),
      para([txt("差动保护的核心是比较各侧电流之和（差动电流）与各侧电流幅值之和（制动电流）的比率关系：")]),
      ...spacer(1),
      ...codeBlock([
        "  差动电流（标幺值）：",
        "    Id = |∑ I_k_pu|   （各侧归一化电流相量之和的模）",
        "",
        "  制动电流（标幺值）——常见两种定义：",
        "    方式A（求和型）：Ir = (|I_H_pu| + |I_L_pu|) / 2",
        "    方式B（最大值型）：Ir = max(|I_H_pu|, |I_L_pu|)",
        "",
        "  注：不同厂家保护装置选用方式不同，必须按整定书确认",
      ]),
      ...spacer(1),
      para([txt("分段比率制动特性（最常见形式）：")]),
      ...codeBlock([
        "  区段1（低制动区，Ir ≤ Ir_break）：",
        "    Id_threshold = Id_min + K1 × Ir",
        "",
        "  区段2（高制动区，Ir > Ir_break）：",
        "    Id_threshold = Id_min + K1 × Ir_break + K2 × (Ir - Ir_break)",
        "",
        "  动作条件：Id ≥ Id_threshold",
      ]),
      ...spacer(1),
      noteBox("注意", "部分厂家（如南瑞 RCS-978、许继 WBH-821）使用三段折线或更复杂特性，" +
        "斜率 K1/K2 定义区间不同，编码时需在配置中注明所用装置型号。", C.yellow),
      ...spacer(1),

      h2("1.2  必要输入参数总表"),
      new Table({
        width: { size: 9740, type: WidthType.DXA },
        columnWidths: [2000, 1400, 1200, 5140],
        rows: [
          headerRow(["参数", "符号", "示例值", "说明"], [2000, 1400, 1200, 5140]),
          dataRow(["额定容量", "Sn", "40 MVA", "变压器铭牌容量"], [2000, 1400, 1200, 5140]),
          dataRow(["高压侧额定电压（线）", "UH_kV", "110 kV", "铭牌电压"], [2000, 1400, 1200, 5140], C.skyBlue),
          dataRow(["低压侧额定电压（线）", "UL_kV", "10.5 kV", "铭牌电压"], [2000, 1400, 1200, 5140]),
          dataRow(["接线组别", "group", "YNd11", "高压侧在前，如 YNd11 / Yd5 / YNy0"], [2000, 1400, 1200, 5140], C.skyBlue),
          dataRow(["高压侧CT变比（一/二）", "nCTH", "300/5", "整数比或小数"], [2000, 1400, 1200, 5140]),
          dataRow(["低压侧CT变比（一/二）", "nCTL", "3000/5", ""], [2000, 1400, 1200, 5140], C.skyBlue),
          dataRow(["差动启动电流", "Id_min_pu", "0.3", "以各侧二次额定电流为基准的标幺值"], [2000, 1400, 1200, 5140]),
          dataRow(["制动斜率1", "K1", "0.3", "低制动区斜率"], [2000, 1400, 1200, 5140], C.skyBlue),
          dataRow(["制动斜率2", "K2", "0.5", "高制动区斜率"], [2000, 1400, 1200, 5140]),
          dataRow(["拐点电流", "Ir_break_pu", "1.0", "区段分界制动电流（标幺值）"], [2000, 1400, 1200, 5140], C.skyBlue),
          dataRow(["制动电流定义方式", "Ir_mode", "\"avg\" / \"max\"", "求和型（avg）或最大值型（max）"], [2000, 1400, 1200, 5140]),
          dataRow(["软件补偿方向", "comp_dir", "\"H\" / \"L\"", "对哪侧电流施加角差补偿矩阵"], [2000, 1400, 1200, 5140], C.skyBlue),
          dataRow(["二次谐波制动比", "K2f", "0.15", "励磁涌流判据（暂不参与制动校验）"], [2000, 1400, 1200, 5140]),
        ]
      }),
      ...spacer(2),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 第二章
      // ══════════════════════════════════════════════════════════════
      h1("第二章  归一化与组别角差补偿"),

      h2("2.1  各侧额定二次电流计算"),
      para("两侧电流必须归一化到同一标幺基准才能相减得到有效的差动电流。"),
      ...codeBlock([
        "import math",
        "",
        "def calc_rated_currents(Sn_MVA, UH_kV, UL_kV, nCTH, nCTL):",
        "    Sn  = Sn_MVA * 1e6",
        "    I_H_1st = Sn / (math.sqrt(3) * UH_kV * 1e3)   # 高压侧一次额定电流 A",
        "    I_L_1st = Sn / (math.sqrt(3) * UL_kV * 1e3)   # 低压侧一次额定电流 A",
        "    I_H_2nd = I_H_1st / nCTH                       # 高压侧二次额定电流 A",
        "    I_L_2nd = I_L_1st / nCTL                       # 低压侧二次额定电流 A",
        "    return I_H_2nd, I_L_2nd",
      ]),
      ...spacer(1),

      h2("2.2  角差补偿原理"),
      para([
        txt("对于 YNd 或 Yd 变压器，两侧电流之间存在 "),
        bold("组别角差"),
        txt("（每组 30°）。若不补偿，正常穿越电流也会产生差动量，保护误动。"),
      ]),
      para([
        txt("角差补偿有两种实现路径：")
      ]),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
        bold("硬件补偿（CT外部接线）"),
        txt("：通过 CT 二次侧 △ 接线抵消相位差，同时消除零序分量。老式机电保护常用。"),
      ], spacing: { before: 60, after: 60 } }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
        bold("软件补偿（内部矩阵变换）"),
        txt("：CT 二次侧均按 Y 接线，由保护装置内部对指定侧电流做矩阵旋转。现代数字保护主流方式。"),
      ], spacing: { before: 60, after: 60 } }),
      ...spacer(1),

      h2("2.3  全组别补偿矩阵（YNd1 ~ YNd11 奇数组）"),
      para([
        txt("变压器组别决定低压侧（△侧）超前高压侧（Y侧）的角度：组别编号 × 30°。"),
        txt("补偿方向由 "),
        bold("comp_dir"),
        txt(" 参数控制："),
      ]),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
        bold("comp_dir = 'H'（角转星，对高压侧施加补偿）"),
        txt("：将高压侧 Y 型电流变换为等效 △ 型，消除角差。"),
      ], spacing: { before: 60, after: 60 } }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [
        bold("comp_dir = 'L'（星转角，对低压侧施加补偿）"),
        txt("：将低压侧 △ 型电流变换为等效 Y 型，消除角差。"),
      ], spacing: { before: 60, after: 60 } }),
      ...spacer(1),
      noteBox("重要", "两种方向补偿结果等效（差动量相同），选哪种取决于保护装置的设计。实际工程必须查看装置说明书确认。", C.orange),
      ...spacer(1),
      ...codeBlock([
        "import numpy as np",
        "import cmath, math",
        "",
        "def get_compensation_matrix(group_str, comp_dir):",
        "    \"\"\"",
        "    参数:",
        "      group_str : 接线组别字符串，如 'YNd11', 'Yd5', 'YNy0'",
        "      comp_dir  : 'H'=对高压侧补偿 | 'L'=对低压侧补偿",
        "    返回:",
        "      M         : 3x3 复数矩阵，左乘原三相电流列向量 [IA, IB, IC]^T",
        "    \"\"\"",
        "    # 解析组别编号（如 YNd11 → 11，Yd5 → 5，YNy0 → 0）",
        "    import re",
        "    m = re.search(r'(\\d+)$', group_str)",
        "    grp = int(m.group(1)) if m else 0",
        "",
        "    # 低压侧超前高压侧的角度（弧度）",
        "    # 规定：组别号 × 30° 为低压侧超前量",
        "    theta_low_leads = grp * 30 * math.pi / 180",
        "",
        "    # ─── 角转星矩阵 M_delta2y ────────────────────────────",
        "    # 将 Y 型三相电流转换为等效 △ 型（用于补偿高压 Y 侧）",
        "    # 补偿角 = theta_low_leads（让高压侧转到与低压侧同相位）",
        "    # 公式：I_A' = (I_A - I_B) / sqrt(3)",
        "    #        旋转 theta 后对应到低压侧方向",
        "    # 通用旋转角: alpha = -theta_low_leads（反向旋转到高压侧坐标）",
        "    a = cmath.exp(1j * 2 * math.pi / 3)   # 旋转算子 120°",
        "    a2 = a * a",
        "",
        "    def rot(angle):",
        "        return cmath.exp(1j * angle)",
        "",
        "    if comp_dir == 'H':",
        "        # 对高压侧（Y）施加补偿：旋转 -theta_low_leads",
        "        # 差接矩阵（消除零序同时提供 30° 移相）再乘旋转因子",
        "        # 完整矩阵（行=A'B'C'，列=A B C）：",
        "        angle = -theta_low_leads",
        "        r = rot(angle) / math.sqrt(3)",
        "        M = np.array([",
        "            [ r,            -r,              0          ],",
        "            [ 0,             r,             -r          ],",
        "            [-r,             0,              r          ],",
        "        ])",
        "",
        "    elif comp_dir == 'L':",
        "        # 对低压侧（△）施加补偿：旋转 +theta_low_leads",
        "        angle = theta_low_leads",
        "        r = rot(angle) / math.sqrt(3)",
        "        # △→Y 逆变换矩阵：",
        "        M = np.array([",
        "            [ r,            -r,              0          ],",
        "            [ 0,             r,             -r          ],",
        "            [-r,             0,              r          ],",
        "        ])",
        "",
        "    else:",
        "        raise ValueError('comp_dir must be H or L')",
        "",
        "    return M",
        "",
        "def apply_compensation(I_abc, M):",
        "    \"\"\"",
        "    I_abc : np.array([I_A, I_B, I_C]) 复数相量",
        "    M     : 3x3 补偿矩阵",
        "    返回补偿后的三相电流列向量",
        "    \"\"\"",
        "    return M @ I_abc",
      ]),
      ...spacer(1),

      h2("2.4  各组别角差与补偿角度速查表"),
      new Table({
        width: { size: 9740, type: WidthType.DXA },
        columnWidths: [1400, 1600, 1800, 1800, 3140],
        rows: [
          headerRow(["组别", "角差(低超前高)", "软补偿角(H侧)", "软补偿角(L侧)", "典型变压器"], [1400, 1600, 1800, 1800, 3140]),
          dataRow(["Yy0",  "0°",   "0°",    "0°",    "不需要补偿"], [1400, 1600, 1800, 1800, 3140]),
          dataRow(["Yd1",  "30°",  "-30°",  "+30°",  "罕见，特种变压器"], [1400, 1600, 1800, 1800, 3140], C.skyBlue),
          dataRow(["Yd3",  "90°",  "-90°",  "+90°",  "罕见"], [1400, 1600, 1800, 1800, 3140]),
          dataRow(["Yd5",  "150°", "-150°", "+150°", "部分配网变压器"], [1400, 1600, 1800, 1800, 3140], C.skyBlue),
          dataRow(["Yd7",  "210°", "-210°", "+210°", "罕见"], [1400, 1600, 1800, 1800, 3140]),
          dataRow(["Yd9",  "270°", "-270°", "+270°", "部分特种变压器"], [1400, 1600, 1800, 1800, 3140], C.skyBlue),
          dataRow(["YNd11","330°", "-330°", "+330°", "最常见！110kV/220kV 主变"], [1400, 1600, 1800, 1800, 3140]),
          dataRow(["YNy0", "0°",   "0°",    "0°",    "厂用变、部分配网"], [1400, 1600, 1800, 1800, 3140], C.skyBlue),
        ]
      }),
      ...spacer(1),
      noteBox("说明", "YNd11 是中国电网中最常见的主变组别（330° = -30°），软件补偿时高压侧电流需旋转 -30° 并经差接消零序。" +
        "YNy0 两侧同相，无角差，但仍需处理零序分量，通常在保护内部另设零序电流滤除逻辑。", C.green),
      ...spacer(2),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 第三章
      // ══════════════════════════════════════════════════════════════
      h1("第三章  比率制动斜率校验算法"),

      para("比率制动斜率校验的目标是：在给定制动电流 Ir 下，找到使保护恰好在动作边界的差动电流 Id，" +
        "然后换算成测试仪实际注入的电流有效值和相角。"),
      ...spacer(1),

      h2("3.1  两种接线模式定义"),

      h3("3.1.1  单相平衡接线（Single-Phase Balance）"),
      para("只通入一相故障电流，另两相为零。高低压侧同一相同时注入，通过改变两侧电流幅值比来调节 Id/Ir。"),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("优点：接线简单，适合三路电流输出的继保仪")], spacing: { before: 60, after: 60 } }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("缺点：不模拟三相对称运行状态，补偿矩阵对单相注入的响应需单独验证")], spacing: { before: 60, after: 60 } }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("适用：初步校验、小电流差动启动整定值校验")], spacing: { before: 60, after: 60 } }),
      ...spacer(1),

      h3("3.1.2  三相平衡接线（Three-Phase Balance）"),
      para("高低压侧均注入对称三相电流，高压侧取参考相角，低压侧相对高压侧反相（穿越）或同相（内部故障），" +
        "通过幅值差产生差动量。"),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("优点：真实模拟穿越状态，能充分激励保护的零序滤除和补偿逻辑")], spacing: { before: 60, after: 60 } }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("缺点：需要六路电流输出，接线复杂")], spacing: { before: 60, after: 60 } }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [txt("适用：制动斜率完整扫描、出厂调试、标准验收测试")], spacing: { before: 60, after: 60 } }),
      ...spacer(1),
      noteBox("核心区别", "单相接线时制动电流定义中的标幺化基准是单相额定电流；" +
        "三相平衡接线时是对称三相，补偿矩阵起完整作用。两种方式得到的 K1/K2 应相同，但注入量计算逻辑不同。", C.yellow),
      ...spacer(1),

      h2("3.2  单相平衡接线注入量计算"),
      ...codeBlock([
        "def calc_single_phase_inject(Ir_pu, Id_pu, I_H_2nd_rated, I_L_2nd_rated,",
        "                             side='H_fixed'):",
        "    \"\"\"",
        "    单相平衡接线：只注入 A 相，B/C 相为零",
        "",
        "    Id = |iH - iL|  （同向流入，差动方向相减）",
        "    Ir = (iH + iL) / 2  （求和型）",
        "",
        "    联立求解：",
        "      iH = Ir + Id/2   （高压侧标幺值）",
        "      iL = Ir - Id/2   （低压侧标幺值）",
        "",
        "    注：此关系适用于 comp_dir='H'（对高压侧补偿），",
        "        iH 为补偿后的高压侧，iL 为低压侧；",
        "        两者异号时保护感受穿越，同号时感受内部故障。",
        "    \"\"\"",
        "    iH_pu = Ir_pu + Id_pu / 2   # 高压侧标幺值",
        "    iL_pu = Ir_pu - Id_pu / 2   # 低压侧标幺值（>0 表示穿越方向）",
        "",
        "    # 换算实际安培值（二次侧，直接注入测试仪）",
        "    I_H_inject = abs(iH_pu) * I_H_2nd_rated   # A",
        "    I_L_inject = abs(iL_pu) * I_L_2nd_rated   # A",
        "",
        "    # 单相接线相角：",
        "    #   高压侧 IA 参考 0°",
        "    #   低压侧 IA 与高压侧同相（制动方向反向流出 = 测试仪角度 180°）",
        "    angle_H_A_deg = 0.0",
        "    angle_L_A_deg = 180.0  # 穿越时低压侧反向",
        "",
        "    return {",
        "        'I_H_A': {'magnitude': round(I_H_inject, 4), 'angle_deg': angle_H_A_deg},",
        "        'I_H_B': {'magnitude': 0.0,                  'angle_deg': 0.0},",
        "        'I_H_C': {'magnitude': 0.0,                  'angle_deg': 0.0},",
        "        'I_L_A': {'magnitude': round(I_L_inject, 4), 'angle_deg': angle_L_A_deg},",
        "        'I_L_B': {'magnitude': 0.0,                  'angle_deg': 0.0},",
        "        'I_L_C': {'magnitude': 0.0,                  'angle_deg': 0.0},",
        "    }",
      ]),
      ...spacer(1),

      h2("3.3  三相平衡接线注入量计算"),
      ...codeBlock([
        "import cmath, math",
        "",
        "def calc_three_phase_inject(Ir_pu, Id_pu, I_H_2nd_rated, I_L_2nd_rated,",
        "                            group_str, comp_dir, Ir_mode='avg'):",
        "    \"\"\"",
        "    三相平衡接线：高低压侧各注入对称三相电流",
        "",
        "    思路：",
        "      设高压侧 A 相注入电流标幺值为 iH，低压侧为 iL",
        "      补偿后：",
        "        I_H_comp = iH（comp_dir='H' 时矩阵输出的 A 相幅值 = iH/√3，需折算）",
        "        I_L_comp = iL（直接）",
        "",
        "      对于 YNd11 + comp_dir='H'：",
        "        差接矩阵对三相对称电流作用后，输出幅值 = 输入幅值（√3 因子在归一化中消除）",
        "        前提：I_H_2nd_rated 已按差接后折算，或保护内部自动处理",
        "",
        "      穿越方向：低压侧与高压侧相差 180°（流入 = 流出）",
        "      差动量 = |iH_comp - iL_comp|",
        "               ≈ iH_comp - iL_comp  （穿越时异号相减）",
        "",
        "    简化计算（对称三相，差动只取 A 相等效）：",
        "      iH_pu = Ir + Id/2",
        "      iL_pu = Ir - Id/2",
        "    \"\"\"",
        "    pi = math.pi",
        "    j  = 1j",
        "",
        "    iH_pu = Ir_pu + Id_pu / 2",
        "    iL_pu = Ir_pu - Id_pu / 2",
        "",
        "    I_H_amp = iH_pu * I_H_2nd_rated",
        "    I_L_amp = iL_pu * I_L_2nd_rated",
        "",
        "    # 高压侧三相参考（A相 = 0°）",
        "    I_H_A = I_H_amp * cmath.exp(j * 0)",
        "    I_H_B = I_H_amp * cmath.exp(j * (-2*pi/3))",
        "    I_H_C = I_H_amp * cmath.exp(j * (2*pi/3))",
        "",
        "    # 低压侧三相：穿越时 A相 = 180°（方向相反流出）",
        "    # 若 comp_dir='L'，低压侧需额外叠加组别角差",
        "    import re",
        "    grp = int(re.search(r'(\\d+)$', group_str).group(1))",
        "    theta_group = grp * 30 * pi / 180",
        "",
        "    # 低压侧参考角：穿越 180° + 组别角差补偿",
        "    if comp_dir == 'H':",
        "        # 高压侧被补偿，低压侧直接注入",
        "        offset = pi   # 穿越反向",
        "    else:",
        "        # 低压侧被补偿（星转角），需在原始注入时反向消除角差",
        "        # 测试仪注入的是补偿前的原始低压侧电流",
        "        # 补偿矩阵内部旋转 +theta，所以测试仪需多旋转 -theta",
        "        offset = pi - theta_group",
        "",
        "    I_L_A = I_L_amp * cmath.exp(j * offset)",
        "    I_L_B = I_L_amp * cmath.exp(j * (offset - 2*pi/3))",
        "    I_L_C = I_L_amp * cmath.exp(j * (offset + 2*pi/3))",
        "",
        "    def fmt(c):",
        "        return {'magnitude': round(abs(c), 4),",
        "                'angle_deg': round(math.degrees(cmath.phase(c)), 2)}",
        "",
        "    return {",
        "        'I_H_A': fmt(I_H_A), 'I_H_B': fmt(I_H_B), 'I_H_C': fmt(I_H_C),",
        "        'I_L_A': fmt(I_L_A), 'I_L_B': fmt(I_L_B), 'I_L_C': fmt(I_L_C),",
        "    }",
      ]),
      ...spacer(1),

      h2("3.4  动作边界反推（核心：固定 Ir 扫 Id 临界值）"),
      ...codeBlock([
        "def calc_boundary_Id(Ir_pu, Id_min_pu, K1, K2, Ir_break_pu):",
        "    \"\"\"返回恰好在动作边界的 Id 临界值\"\"\"",
        "    if Ir_pu <= Ir_break_pu:",
        "        return Id_min_pu + K1 * Ir_pu",
        "    else:",
        "        return Id_min_pu + K1 * Ir_break_pu + K2 * (Ir_pu - Ir_break_pu)",
        "",
        "",
        "def calc_Ir_from_currents(iH_pu, iL_pu, Ir_mode='avg'):",
        "    \"\"\"从两侧标幺值计算制动电流\"\"\"",
        "    if Ir_mode == 'avg':",
        "        return (abs(iH_pu) + abs(iL_pu)) / 2",
        "    else:",
        "        return max(abs(iH_pu), abs(iL_pu))",
        "",
        "",
        "def calc_Id_from_currents(iH_pu_vec, iL_pu_vec):",
        "    \"\"\"从补偿后的两侧电流相量计算差动电流（复数相量求和取模）\"\"\"",
        "    return abs(iH_pu_vec + iL_pu_vec)",
        "",
        "",
        "def sweep_slope(Ir_list, Id_min_pu, K1, K2, Ir_break_pu,",
        "                I_H_2nd_rated, I_L_2nd_rated,",
        "                group_str, comp_dir, inject_mode='three_phase'):",
        "    \"\"\"",
        "    扫描制动斜率曲线：对每个 Ir 点返回临界注入量",
        "    返回列表，每项包含: {Ir_pu, Id_boundary, inject_H, inject_L, ...}",
        "    \"\"\"",
        "    results = []",
        "    for Ir_pu in Ir_list:",
        "        Id_bnd = calc_boundary_Id(Ir_pu, Id_min_pu, K1, K2, Ir_break_pu)",
        "        if inject_mode == 'single_phase':",
        "            inj = calc_single_phase_inject(Ir_pu, Id_bnd,",
        "                      I_H_2nd_rated, I_L_2nd_rated)",
        "        else:",
        "            inj = calc_three_phase_inject(Ir_pu, Id_bnd,",
        "                      I_H_2nd_rated, I_L_2nd_rated,",
        "                      group_str, comp_dir)",
        "        results.append({",
        "            'Ir_pu':       round(Ir_pu, 3),",
        "            'Id_boundary': round(Id_bnd, 4),",
        "            'inject':      inj,",
        "            'expected':    'trip at boundary'",
        "        })",
        "    return results",
      ]),
      ...spacer(2),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 第四章
      // ══════════════════════════════════════════════════════════════
      h1("第四章  继保测试仪接线方案"),

      h2("4.1  六路电流输出（标准方案）"),

      para("六路电流输出的继保仪（如 OMICRON CMC356、继保 FREJA500、国电南自 HM1002 等）可同时输出高低压两侧完整三相电流，" +
        "是差动保护校验的标准配置。"),
      ...spacer(1),

      new Table({
        width: { size: 9740, type: WidthType.DXA },
        columnWidths: [1600, 1600, 1800, 4740],
        rows: [
          headerRow(["测试仪通道", "接入侧", "接至端子", "说明"], [1600, 1600, 1800, 4740]),
          dataRow(["I1_A / I2_A", "高压侧", "保护 IHA", "I1正端接保护，I2负端就近接地"], [1600, 1600, 1800, 4740]),
          dataRow(["I1_B / I2_B", "高压侧", "保护 IHB", ""], [1600, 1600, 1800, 4740], C.skyBlue),
          dataRow(["I1_C / I2_C", "高压侧", "保护 IHC", ""], [1600, 1600, 1800, 4740]),
          dataRow(["I3_A / I4_A", "低压侧", "保护 ILA", "低压侧接线同上"], [1600, 1600, 1800, 4740], C.skyBlue),
          dataRow(["I3_B / I4_B", "低压侧", "保护 ILB", ""], [1600, 1600, 1800, 4740]),
          dataRow(["I3_C / I4_C", "低压侧", "保护 ILC", ""], [1600, 1600, 1800, 4740], C.skyBlue),
          dataRow(["开入量 DI1", "—", "保护跳闸出口", "测时间用，测到开入量变化即计算动作时间"], [1600, 1600, 1800, 4740]),
        ]
      }),
      ...spacer(1),
      noteBox("极性原则", "所有 CT 减极性（P1→S1 方向为流入正方向）。高压侧 CT 极性端朝母线，低压侧 CT 极性端朝变压器。" +
        "测试仪的电流正方向与保护装置的标注方向一致，错误的极性会导致差动量计算错误。", C.orange),
      ...spacer(1),

      h2("4.2  三路电流输出（受限方案）"),
      para("三路电流输出的继保仪只有一组三相，无法同时模拟两侧。有以下三种处理方式："),
      ...spacer(1),

      h3("方式A：单侧注入法（最简单）"),
      para("只接高压侧或低压侧，另一侧 CT 二次短接。此时差动电流等于制动电流之半，只能校验差动最小动作电流，" +
        "无法扫斜率。"),
      ...codeBlock([
        "# 单侧注入（高压侧接测试仪，低压侧短接）",
        "# iL_pu = 0",
        "# Id = iH,  Ir = iH/2  → 只能扫 Id_min 附近",
        "# 测试仪输出：",
        "I_H_A = I_target  # 从 Id_min 开始逐步升高",
        "I_H_B = I_target * exp(-j*120°)",
        "I_H_C = I_target * exp(+j*120°)",
        "# 低压侧端子短接，不接测试仪",
      ]),
      ...spacer(1),

      h3("方式B：分步换接法（推荐）"),
      para("将制动斜率测试拆为多个固定点，每次手动调整测试仪量程："),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [txt("第一步：接高压侧，低压侧短接，确认差动最小动作电流 Id_min")], spacing: { before: 60, after: 60 } }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [txt("第二步：断开低压侧短接，接低压侧，高压侧保持原接线（利用装置 TA 断线判据短暂允许单侧注入）")], spacing: { before: 60, after: 60 } }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [txt("第三步：通过计算目标注入量，两步注入量之差即等效斜率测试结果")], spacing: { before: 60, after: 60 } }),
      ...spacer(1),

      h3("方式C：CT 二次并联法（特殊场合）"),
      para("将测试仪一路电流同时并联接入高低压侧（两路共用），通过外部分流电阻分配电流比例，模拟差动量。" +
        "此方法精度差，仅作应急参考，不推荐用于正式试验。"),
      ...spacer(1),

      h2("4.3  不同接线方式下的测试仪设置对比表"),
      new Table({
        width: { size: 9740, type: WidthType.DXA },
        columnWidths: [2200, 1700, 1700, 2000, 2140],
        rows: [
          headerRow(["测试项目", "测试仪类型", "接线模式", "电流路数需求", "备注"], [2200, 1700, 1700, 2000, 2140]),
          dataRow(["差动最小动作电流", "三路/六路均可", "单侧注入", "3路", "最基础测试"], [2200, 1700, 1700, 2000, 2140]),
          dataRow(["制动斜率 K1 扫描", "六路推荐", "三相平衡", "6路", "最准确"], [2200, 1700, 1700, 2000, 2140], C.skyBlue),
          dataRow(["制动斜率 K2 扫描", "六路", "三相平衡", "6路", "高制动区"], [2200, 1700, 1700, 2000, 2140]),
          dataRow(["穿越性不动作验证", "六路", "三相平衡穿越", "6路", "两侧反向 180°"], [2200, 1700, 1700, 2000, 2140], C.skyBlue),
          dataRow(["励磁涌流制动", "三路/六路", "单侧注入+谐波", "3路", "含二次谐波"], [2200, 1700, 1700, 2000, 2140]),
          dataRow(["动作时间测量", "三路/六路", "单侧大差动", "3路", "I_H = 5×Id_min"], [2200, 1700, 1700, 2000, 2140], C.skyBlue),
        ]
      }),
      ...spacer(2),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 第五章
      // ══════════════════════════════════════════════════════════════
      h1("第五章  完整计算流程与输出数据结构"),

      h2("5.1  主函数入口"),
      ...codeBlock([
        "def calc_diff_protection_test(",
        "    # ── 主变参数 ──",
        "    Sn_MVA,        # float: 额定容量 MVA",
        "    UH_kV,         # float: 高压侧额定线电压 kV",
        "    UL_kV,         # float: 低压侧额定线电压 kV",
        "    group_str,     # str:   接线组别 如 'YNd11' / 'Yd5' / 'YNy0'",
        "    nCTH,          # float: 高压侧CT变比（一次/二次，如 60.0 for 300/5）",
        "    nCTL,          # float: 低压侧CT变比",
        "    # ── 保护整定参数 ──",
        "    Id_min_pu,     # float: 差动最小动作电流（标幺值）",
        "    K1,            # float: 制动斜率1",
        "    K2,            # float: 制动斜率2",
        "    Ir_break_pu,   # float: 拐点制动电流（标幺值）",
        "    Ir_mode,       # str:   'avg' | 'max'",
        "    comp_dir,      # str:   'H'=高压侧补偿 | 'L'=低压侧补偿",
        "    # ── 测试工况 ──",
        "    test_mode,     # str:   'sweep_slope' | 'single_Ir' | 'through' | 'min_Id'",
        "    inject_mode,   # str:   'single_phase' | 'three_phase'",
        "    ct_channels,   # int:   3 | 6",
        "    # ── 扫描参数（test_mode='sweep_slope' 时用）──",
        "    Ir_scan_list=None,   # list[float]: 制动电流扫描点，如 [0.5,1.0,1.5,2.0,3.0]",
        "    Ir_single=None,      # float: 单点测试时的制动电流",
        ") -> dict:",
        "",
        "    I_H_2nd, I_L_2nd = calc_rated_currents(Sn_MVA, UH_kV, UL_kV, nCTH, nCTL)",
        "",
        "    if test_mode == 'sweep_slope':",
        "        if Ir_scan_list is None:",
        "            Ir_scan_list = [0.3, 0.5, 0.8, 1.0, 1.5, 2.0, 2.5, 3.0]",
        "        curve = sweep_slope(Ir_scan_list, Id_min_pu, K1, K2, Ir_break_pu,",
        "                            I_H_2nd, I_L_2nd, group_str, comp_dir, inject_mode)",
        "",
        "    elif test_mode == 'single_Ir':",
        "        Id_bnd = calc_boundary_Id(Ir_single, Id_min_pu, K1, K2, Ir_break_pu)",
        "        if inject_mode == 'single_phase':",
        "            inj = calc_single_phase_inject(Ir_single, Id_bnd, I_H_2nd, I_L_2nd)",
        "        else:",
        "            inj = calc_three_phase_inject(Ir_single, Id_bnd, I_H_2nd, I_L_2nd,",
        "                      group_str, comp_dir)",
        "        curve = [{'Ir_pu': Ir_single, 'Id_boundary': Id_bnd, 'inject': inj}]",
        "",
        "    return {",
        "        # ── 基础计算量 ──",
        "        'I_H_2nd_rated': round(I_H_2nd, 4),   # A",
        "        'I_L_2nd_rated': round(I_L_2nd, 4),   # A",
        "        'group':         group_str,",
        "        'comp_dir':      comp_dir,",
        "        'inject_mode':   inject_mode,",
        "        'ct_channels':   ct_channels,",
        "",
        "        # ── 斜率校验结果列表 ──",
        "        'slope_test_points': curve,",
        "        # 每项结构：",
        "        # {",
        "        #   'Ir_pu': float,           制动电流标幺值",
        "        #   'Id_boundary': float,     临界差动电流",
        "        #   'inject': {               测试仪注入量",
        "        #     'I_H_A': {'magnitude': A, 'angle_deg': deg},",
        "        #     'I_H_B': ...,  'I_H_C': ...,",
        "        #     'I_L_A': ...,  'I_L_B': ...,  'I_L_C': ...",
        "        #   },",
        "        #   'expected': 'trip at boundary'",
        "        # }",
        "",
        "        # ── 接线指导 ──",
        "        'wiring_guide': {",
        "            'ct_channels':    ct_channels,",
        "            'method':         'six_channel_full' if ct_channels==6",
        "                              else 'three_channel_single_side',",
        "            'H_terminal':     '保护装置高压侧电流输入端子（IHA/IHB/IHC）',",
        "            'L_terminal':     '保护装置低压侧电流输入端子（ILA/ILB/ILC）' if ct_channels==6",
        "                              else '短接（悬空或短接至零，视装置TA断线逻辑）',",
        "            'polarity_note':  '高压侧CT S1朝母线，低压侧CT S1朝变压器',",
        "            'phase_note':     f'低压侧电流超前高压侧 {grp*30}°（{group_str} 组别），'",
        "                              f'测试仪低压侧相角应偏移 180° + 补偿角',",
        "            'comp_note':      f'软件补偿施加在 {comp_dir} 侧，测试仪注入为补偿前原始值',",
        "        },",
        "",
        "        # ── 特性曲线数据（供UI绘图）──",
        "        'characteristic_curve': [",
        "            {'Ir': x/10, 'Id_threshold': calc_boundary_Id(x/10, Id_min_pu, K1, K2, Ir_break_pu)}",
        "            for x in range(0, 31)",
        "        ]",
        "    }",
      ]),
      ...spacer(2),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 第六章
      // ══════════════════════════════════════════════════════════════
      h1("第六章  典型测试项目与注意事项"),

      h2("6.1  标准测试项目清单"),
      new Table({
        width: { size: 9740, type: WidthType.DXA },
        columnWidths: [2000, 1800, 1800, 1600, 2540],
        rows: [
          headerRow(["测试项目", "test_mode 参数", "inject_mode", "CT路数", "合格判据"], [2000, 1800, 1800, 1600, 2540]),
          dataRow(["差动最小动作电流", "min_Id", "single_phase", "3路", "实测值 ≤ 整定值×1.05"], [2000, 1800, 1800, 1600, 2540]),
          dataRow(["K1 斜率校验（低制动区）", "sweep_slope", "three_phase", "6路", "3~5个点，线性相关 R²>0.99"], [2000, 1800, 1800, 1600, 2540], C.skyBlue),
          dataRow(["K2 斜率校验（高制动区）", "sweep_slope", "three_phase", "6路", "同上"], [2000, 1800, 1800, 1600, 2540]),
          dataRow(["穿越性故障不动作", "through", "three_phase", "6路", "注入 1.2 倍额定，保护不动作"], [2000, 1800, 1800, 1600, 2540], C.skyBlue),
          dataRow(["励磁涌流制动校验", "inrush", "single_phase", "3路", "注入 15% 二次谐波，保护不动作"], [2000, 1800, 1800, 1600, 2540]),
          dataRow(["差动动作时间", "timing", "single_phase", "3路", "通常 ≤ 30ms"], [2000, 1800, 1800, 1600, 2540], C.skyBlue),
          dataRow(["TA 断线报警", "ta_break", "single_phase", "6路", "单侧失流后 ≤ 2s 发告警"], [2000, 1800, 1800, 1600, 2540]),
        ]
      }),
      ...spacer(1),

      h2("6.2  常见错误与排查"),
      new Table({
        width: { size: 9740, type: WidthType.DXA },
        columnWidths: [2800, 3300, 3640],
        rows: [
          headerRow(["现象", "可能原因", "排查方法"], [2800, 3300, 3640]),
          dataRow(["穿越时差动量偏大", "组别角差未补偿或补偿方向错误", "检查 comp_dir 参数和保护装置补偿设置是否一致"], [2800, 3300, 3640]),
          dataRow(["单相注入时保护不动作", "TA 断线逻辑锁定了差动出口", "关闭 TA 断线闭锁或改为三相注入"], [2800, 3300, 3640], C.skyBlue),
          dataRow(["动作边界电流明显偏小", "CT 变比输入错误，基准电流算错", "重新核算 I_H_2nd_rated / I_L_2nd_rated"], [2800, 3300, 3640]),
          dataRow(["高低压侧注入极性反", "接线极性与保护预期相反", "对调一侧 CT 二次的 S1/S2 端子"], [2800, 3300, 3640], C.skyBlue),
          dataRow(["斜率测试结果偏离整定值 >10%", "Ir_mode 设置与装置不符", "确认装置用求和型(avg)还是最大值型(max)"], [2800, 3300, 3640]),
        ]
      }),
      ...spacer(1),

      h2("6.3  AI 集成开发注意事项"),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
        bold("组别解析："),
        txt("group_str 中后缀数字为组别号（1~12），需用正则提取整数，不要假设固定格式。"),
      ], spacing: { before: 80, after: 80 } }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
        bold("角度单位："),
        txt("内部计算全部用弧度（radians），仅在输出到 UI 或测试仪设置时转换为度（degrees）。"),
      ], spacing: { before: 80, after: 80 } }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
        bold("标幺值基准："),
        txt("每侧独立以本侧额定二次电流为基准，归一化后两侧才能直接相减计算差动量。"),
      ], spacing: { before: 80, after: 80 } }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
        bold("制动电流定义："),
        txt("在输入参数中用 Ir_mode='avg'|'max' 明确区分，影响 iH/iL 的反推关系式。"),
      ], spacing: { before: 80, after: 80 } }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
        bold("YNy0 特殊处理："),
        txt("组别为 0，无角差，但保护装置仍有零序电流滤除逻辑（软件内部实现，不影响测试仪注入量计算）。"),
      ], spacing: { before: 80, after: 80 } }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
        bold("三绕组扩展："),
        txt("三绕组变压器需增加第三侧参数（UC_kV、nCTC、comp_dir_C），差动电流改为三侧相量之和，制动电流定义更复杂，建议单独扩展模块。"),
      ], spacing: { before: 80, after: 80 } }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [
        bold("数值精度："),
        txt("相角计算误差 < 0.5°，电流幅值误差 < 0.5%，输出时保留 4 位小数。"),
      ], spacing: { before: 80, after: 80 } }),

      ...spacer(2),
      divider(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: "文档结束 | 主变差动保护校验核心算法手册 v1.0", font: "Arial", size: 18, color: C.midGray, italics: true })],
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/主变差动保护校验算法手册.docx", buffer);
  console.log("Done");
});
