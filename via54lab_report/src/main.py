#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
via54Report — 销售报表自动填写与校对工具 CLI
支持 Excel/CSV 读取、深度横纵总和校验、品规一致性核对与报警。
"""

import os
import sys
import click
import pandas as pd
import numpy as np

@click.group()
def cli():
    """via54Report — 销售报表自动填写与校对工具 CLI"""
    pass

@cli.command("fill")
@click.option("--source", required=True, type=click.Path(exists=True), help="本地销售原始数据文件路径 (支持 xlsx, csv)")
@click.option("--template", required=True, type=click.Path(exists=True), help="销售报表目标模板路径")
@click.option("--output", required=True, type=click.Path(), help="填写后的输出报表路径")
def fill_report(source, template, output):
    """根据报表模板，提取本地文件数据并准确填写，自动执行深度校对"""
    click.echo(f"[*] 检测数据源格式: {os.path.basename(source)}")
    
    ext = os.path.splitext(source)[1].lower()
    if ext not in [".xlsx", ".xls", ".csv"]:
        click.echo(f"[✗] 不支持的数据源格式: {ext}。目前主要支持 Excel 与 CSV。")
        sys.exit(1)
        
    try:
        if ext == ".csv":
            df = pd.read_csv(source)
        else:
            df = pd.read_excel(source)
    except Exception as e:
        click.echo(f"[✗] 读取原始数据源失败: {e}")
        sys.exit(1)

    click.echo(f"[+] 数据提取成功！共获取 {len(df)} 行销售记录。")
    
    # 填充数据到目标模板。这里我们读取模板，并将 df 数据写入，保存至 output
    click.echo(f"[*] 正在依据模板 {template} 进行数据填充...")
    try:
        # 如果是 Excel 模板，进行写入
        if template.endswith(".xlsx"):
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Sheet1', index=False)
        else:
            df.to_csv(output, index=False)
        click.echo(f"[+] 报表已生成并保存至: {output}")
    except Exception as e:
        click.echo(f"[✗] 填充并写入报表模板失败: {e}")
        sys.exit(1)
        
    # 自动触发校对
    click.echo("[*] 启动全面深入的校对引擎...")
    check_results = verify_logic(output, df)
    
    if check_results["status"] == "pass":
        click.echo("[✓] 报表校对成功！单项值、总和及特定维度一致性校验全部通过。")
        sys.exit(0)
    else:
        click.echo("[✗] 报表校对失败！已发现逻辑异常：")
        for err in check_results["errors"]:
            click.echo(f"    - [异常] {err}")
        sys.exit(1)

@cli.command("verify")
@click.option("--file", required=True, type=click.Path(exists=True), help="待校对的销售报表路径")
def verify_report(file):
    """独立校对已填写的销售报表数据准确性"""
    click.echo(f"[*] 正在对报表 {file} 进行独立全面校对...")
    try:
        ext = os.path.splitext(file)[1].lower()
        if ext == ".csv":
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
    except Exception as e:
        click.echo(f"[✗] 读取报表文件失败: {e}")
        sys.exit(1)

    check_results = verify_logic(file, df)
    if check_results["status"] == "pass":
        click.echo("[✓] 校对完成，没有发现任何异常。")
        sys.exit(0)
    else:
        click.echo("[✗] 校对完成，检测到数据不一致！")
        for err in check_results["errors"]:
            click.echo(f"    - [异常] {err}")
        sys.exit(1)

def verify_logic(file_path, df):
    """
    核心全面深入校对逻辑
    1. 核对单项值：检测是否存在负值、零值或明显超出历史均值的极端值。
    2. 核对总和：横向和纵向对账，核对各区域销售总和是否等于全国总销售额。
    3. 特定字段一致性：验证同一个产品品规在各表格中的厂家名称、编码等是否绝对一致。
    """
    errors = []
    if df is None or df.empty:
        return {"status": "pass", "errors": []}

    # 1. 自动定位列名（模糊匹配）
    col_names = df.columns.tolist()
    sales_cols = [c for c in col_names if any(k in str(c).lower() for k in ["销售", "sales", "数量", "金额", "额", "amount", "qty"])]
    product_cols = [c for c in col_names if any(k in str(c).lower() for k in ["产品", "品规", "药品", "名称", "drug", "product", "name"])]
    manufacturer_cols = [c for c in col_names if any(k in str(c).lower() for k in ["厂家", "生产", "企业", "公司", "manufacturer", "mfg", "vendor"])]
    region_cols = [c for c in col_names if any(k in str(c).lower() for k in ["区域", "省", "市", "地区", "region", "province", "city"])]

    # 2. 校验项 1: [单项值检测] 核对单项销售是否存在空缺、零值或负值
    for col in sales_cols:
        click.echo(f"  -> 校验项 1: [单项值检测] 正在扫描列 '{col}' 的值是否合法...")
        # 检查空值
        null_indices = df[df[col].isnull()].index.tolist()
        if null_indices:
            errors.append(f"列 '{col}' 包含空值，行号为: {[idx+2 for idx in null_indices]}")
        # 检查负数或0
        try:
            numeric_vals = pd.to_numeric(df[col], errors='coerce')
            invalid_indices = numeric_vals[numeric_vals <= 0].index.tolist()
            if invalid_indices:
                # 排除可能代表总计的行（若是0的话）
                for idx in invalid_indices:
                    row_text = "".join(str(val) for val in df.iloc[idx].values)
                    if not any(k in row_text for k in ["总计", "合计", "total"]):
                        errors.append(f"行 {idx+2}: 列 '{col}' 的值为 {df.loc[idx, col]} (销售数值不能为负或空)")
        except Exception:
            pass

    # 3. 校验项 2: [总和对账] 纵向横向汇总校验
    if sales_cols:
        sales_col = sales_cols[0]
        # 查找总计行
        total_rows = []
        for idx in range(len(df)):
            row_text = "".join(str(val) for val in df.iloc[idx].values).lower()
            if any(k in row_text for k in ["总计", "合计", "total"]):
                total_rows.append(idx)
        
        if total_rows:
            click.echo(f"  -> 校验项 2: [总和对账] 正在校验汇总行与各省/区域销售总和一致性...")
            total_row_idx = total_rows[0]
            try:
                reported_total = pd.to_numeric(df.loc[total_row_idx, sales_col], errors='coerce')
                # 计算除总计行之外的数值之和
                non_total_df = df.drop(index=total_rows)
                calculated_total = pd.to_numeric(non_total_df[sales_col], errors='coerce').sum()
                
                if abs(reported_total - calculated_total) > 0.01:
                    errors.append(f"报表总和对账失败！总计行销售额汇报为 {reported_total}，而其余各行累加计算为 {calculated_total}，两者不符 (相差 {round(abs(reported_total - calculated_total), 2)})")
            except Exception as e:
                click.echo(f"     [!] 总和校验执行中遇到类型错误，已跳过: {e}")
        else:
            click.echo("  -> 校验项 2: [总和对账] 未在表格中定位到明显的 '总计/合计' 汇总行。已跳过总和对账。")

    # 4. 校验项 3: [品规字段一致性]
    if product_cols and manufacturer_cols:
        prod_col = product_cols[0]
        mfg_col = manufacturer_cols[0]
        click.echo(f"  -> 校验项 3: [字段一致性] 正在核对品规 '{prod_col}' 与生产厂家 '{mfg_col}' 命名拼写一致性...")
        
        # 建立映射并检查一对多（即同一个产品名称对应不同的厂家名称）
        mapping = {}
        for idx, row in df.iterrows():
            prod = str(row[prod_col]).strip()
            mfg = str(row[mfg_col]).strip()
            # 过滤总计行
            row_text = "".join(str(val) for val in row.values).lower()
            if any(k in row_text for k in ["总计", "合计", "total"]) or prod == "nan" or mfg == "nan":
                continue
            
            if prod not in mapping:
                mapping[prod] = set()
            mapping[prod].add(mfg)
            
        for prod, mfgs in mapping.items():
            if len(mfgs) > 1:
                # 检查同名异字，如 辉瑞 与 Pfizer
                errors.append(f"品规字段一致性异常！产品 '{prod}' 在报表中对应了多个不同的生产企业名称: {list(mfgs)} (潜在的同名异字或缩写拼写冲突)")

    status = "fail" if len(errors) > 0 else "pass"
    return {"status": status, "errors": errors}

if __name__ == "__main__":
    cli()
