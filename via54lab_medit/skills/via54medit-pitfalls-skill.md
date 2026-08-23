---
name: via54medit-pitfalls-skill
description: Guidelines on avoiding the 26 academic citation pitfalls in medical report writing (such as confusing mOS with OS and mixing data phases).
version: 1.0.0
---

# via54medit · 26 个学术文献引用与数据对账避坑指南

> 在撰写医学研究与准入策略报告时，大模型极易在数据引用上犯以下典型学术合规性错误。本技能用于对此类风险进行前置质控审计。

## ⚠️ 核心文献引用审计坑表 (避坑精选)

| 规则代码 | 缺陷说明 | 正确操作建议 |
|---|---|---|
| **PITFALL-01** | **混淆中位生存期(mOS)与总生存期(OS)**：在汇报抗肿瘤疗效时，将中位数值当作绝对存活时限。 | 必须严格区分并在表格中独立标注 Median 与 Overall 概念。 |
| **PITFALL-02** | **跨临床试验数据直接进行不科学对比**：如拿 A 药 III 期研究的 PFS 强行与 B 药 II 期数据对比。 | 在报告中必须加注：“非头对头研究（Non-head-to-head），数据仅供参考”。 |
| **PITFALL-03** | **混淆不良事件(AE)分级**：将 3-4 级严重不良事件（TRAE）与 1-2 级轻微事件混为一谈。 | 强制细化分级汇报，不可混淆耐受性特征。 |
| **PITFALL-04** | **虚构文献发表年份与作者拼写**：由于大模型幻觉，瞎编作者姓氏或将 2024 年文献挪到 2018 年。 | 必须开启 via54medit 循证路由器，对文章的 DOI / PMID 及元数据进行强对比核对。 |
| **PITFALL-05** | **忽略置信区间(CI)与P值**：强行宣称疗效差异显著，但研究中 P 值为 0.08（无统计学意义）。 | 检查所有“优于”、“显著提升”的描述后面是否均附带有 \(P < 0.05\) 或相应的 CI 指标。 |
| **PITFALL-06** | **脱离真实说明书宣称超说明书（Off-label）疗效**：在策略中夸大适应症范围。 | 核实说明书的 Indication 范围。 |

## How to Audit

大模型审查时，使用 `medplan_compliance` 工具输入报告文本。合规引擎会调用语义审查提示词，重点匹配上述 6 大类致命缺陷（LIT-PITFALL 警报），若有命中则生成修改建议。
