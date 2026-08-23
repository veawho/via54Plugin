---
name: via54merge-skill
description: Data consolidation and logical validation for sales reports - mapping and resolving manufacturer and dosage discrepancies.
version: 1.0.0
---

# via54merge · 销售数据合并与逻辑对账技能

> 对多表格、多来源的销售对账数据进行自动映射去重、总额核对与同名异字纠正。

## When to Use

Use when:
- Consolidating sales data across multiple excel sheets.
- Resolving manufacturer naming discrepancies (e.g. Pfizer vs 辉瑞).
- Cross-tab logical validation (checking if row sums equal column sums).

## Implementation Guide

1. Map and align column names:
```python
# Identify columns with partial match terms like 'sales', 'manufacturer'
sales_cols = [c for c in cols if any(k in c.lower() for k in ['sales', '销售'])]
```

2. Leverage mapping dictionaries to deduplicate spelling variations:
- Validate that each product maps to a unique manufacturer.
- Flag any one-to-many relationship as a spelling discrepancy.
- Calculate cross-table sum delta.
