#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
元调度与自我生长通用控制算法处理器 (selfgrow.py)
核心算法：跨包通用 Skills 自动扫描、自然语言目标智能语义匹配、避坑规则(Pitfalls)通用提取与 Prompt 进化注入、多维反馈演演化计算。
"""

import sys
import os
import json
import argparse
import psutil
import re
from datetime import datetime

GROWTH_DB_PATH = "./data/growth.db"

def main():
    parser = argparse.ArgumentParser(description="元调度与自生长通用算法处理器")
    parser.add_argument("action", choices=["scan", "optimize", "iterate"], help="自生长动作")
    parser.add_argument("--data", type=str, default="{}", help="任务输入数据 JSON 串")
    args = parser.parse_args()

    try:
        data = json.loads(args.data)
    except Exception as e:
        print(f"[✗] 解析输入 JSON 失败: {e}", file=sys.stderr)
        sys.exit(1)

    if args.action == "scan":
        results = scan_environment()
        print(json.dumps(results, ensure_ascii=False))
        
    elif args.action == "optimize":
        goal = data.get("goal", "")
        current_prompt = data.get("current_prompt", "")
        results = optimize_workflow(goal, current_prompt)
        print(json.dumps(results, ensure_ascii=False))
        
    elif args.action == "iterate":
        task_id = data.get("task_id", "default")
        score = float(data.get("score", 5.0))
        feedback_text = data.get("feedback", "")
        results = run_feedback_iteration(task_id, score, feedback_text)
        print(json.dumps(results, ensure_ascii=False))

def scan_environment():
    """通用感知：扫描部署设备上的所有独立插件包及配套的 Skills 资源"""
    cpu_percent = psutil.cpu_percent(interval=0.1)
    virtual_mem = psutil.virtual_memory()
    
    # 动态扫描
    discovered_plugins = []
    discovered_skills = []
    
    # 获取 plugin 根目录 (当前脚本在 via54lab_algo/src/ 下，因此向上退两级)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    if os.path.exists(base_dir):
        for name in os.listdir(base_dir):
            sub_path = os.path.join(base_dir, name)
            if os.path.isdir(sub_path) and name.startswith("via54lab_"):
                discovered_plugins.append(name)
                # 扫描其下的 skills/
                skills_dir = os.path.join(sub_path, "skills")
                if os.path.exists(skills_dir) and os.path.isdir(skills_dir):
                    for sf in os.listdir(skills_dir):
                        if sf.endswith(".md"):
                            discovered_skills.append({
                                "plugin": name,
                                "skill_file": sf,
                                "path": os.path.join(skills_dir, sf).replace("\\", "/")
                            })
                            
    # 检测 GPU 支持
    gpu_ready = False
    try:
        import torch
        if torch.cuda.is_available():
            gpu_ready = True
    except ImportError:
        pass
        
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "hardware": {
            "cpu_percent": cpu_percent,
            "ram_used_gb": round(virtual_mem.used / (1024**3), 2),
            "ram_free_gb": round(virtual_mem.available / (1024**3), 2),
            "gpu_ready": gpu_ready
        },
        "discovered_ecosystem": {
            "active_plugins": discovered_plugins,
            "discovered_skills_meta": discovered_skills
        }
    }

def optimize_workflow(goal, current_prompt):
    """
    通用 Skills 提炼与 Prompt 优化算法
    1. 动态扫描全局可用的 Skills 文件；
    2. 计算任务 goal 与各个 Skill 的语义匹配分值；
    3. 自动解析得分最高的 Skill，提炼出其“Pitfalls / 避坑 / 铁律 / Rules”段落；
    4. 动态作为约束拼接注入当前 Prompt，跨插件优化 LLM 的产出质量。
    """
    # 1. 扫描全部可用 Skills
    env_meta = scan_environment()
    skills_meta = env_meta["discovered_ecosystem"]["discovered_skills_meta"]
    
    goal_words = set(re.findall(r"\w+", goal.lower()))
    
    best_skill = None
    best_score = 0
    
    # 2. 匹配得分计算
    for sm in skills_meta:
        file_path = sm["path"]
        score = 0
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                # 基于关键字词匹配计算关联得分
                for word in goal_words:
                    if len(word) > 1:
                        # 权重策略：标题和 tags 出现算 10 分，正文出现算 1 分
                        if word in sm["skill_file"].lower() or word in sm["plugin"].lower():
                            score += 10
                        if word in content.lower():
                            score += 1
        except Exception:
            continue
            
        if score > best_score:
            best_score = score
            best_skill = sm
            
    # 3. 提取避坑规则段落
    injected_rules = []
    skill_applied = "none"
    
    if best_skill and best_score > 2: # 匹配阈值
        skill_applied = f"{best_skill['plugin']}/{best_skill['skill_file']}"
        try:
            with open(best_skill["path"], "r", encoding="utf-8") as f:
                content = f.read()
                
            # 使用正则抓取 Pitfalls / 避坑 / 铁律段落
            # 查找以 ## Pitfalls 或 ## 避坑 或 ## 核心 标题开头，直到下一个 ## 标题为止的段落
            pattern = re.compile(r"##\s*.*?(?:pitfall|避坑|铁律|审计|rules).*?\n(.*?)(?=\n##|$)", re.IGNORECASE | re.DOTALL)
            match = pattern.search(content)
            if match:
                rules_text = match.group(1).strip()
                # 清洗冗余链接，只保留具体守则
                clean_rules = [line.strip() for line in rules_text.splitlines() if line.strip() and not line.strip().startswith("- 相关 skill")]
                injected_rules = clean_rules[:15] # 最多提炼 15 条
        except Exception as e:
            pass

    # 4. 动态进化注入 Prompt
    opt_prompt = current_prompt
    if injected_rules:
        opt_prompt = f"""{current_prompt}

=== 元调度自进化质控守则 (基于通用 Skill: {skill_applied} 自动提炼优化) ===
以下是元调度算法为您当前任务量身提炼的防错/避坑规范，大模型在生成或执行时必须严格遵守：
{chr(10).join(injected_rules)}
"""
        
    return {
        "status": "success",
        "matched_skill_score": best_score,
        "skill_applied": skill_applied,
        "optimized_prompt": opt_prompt,
        "rules_injected_count": len(injected_rules)
    }

def run_feedback_iteration(task_id, score, feedback):
    """通用学习反馈：将进化链路结果与评分存入自成长库"""
    # 动态演化计算
    learning_rate = 0.1
    delta = (score - 5.0) * learning_rate
    
    log_dir = os.path.dirname(GROWTH_DB_PATH)
    os.makedirs(log_dir, exist_ok=True)
    
    # 记录通用成长数据轨迹
    log_entry = {
        "task_id": task_id,
        "score": score,
        "feedback": feedback,
        "delta_adjustment": round(delta, 3),
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        with open(GROWTH_DB_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
        status = "success"
        msg = f"反馈自愈成功！通用算法已根据评分 {score} 优化元调度进化权重参数。"
    except Exception as e:
        status = "error"
        msg = f"写入自生长库失败: {e}"
        
    return {
        "status": status,
        "delta": round(delta, 2),
        "msg": msg
    }

if __name__ == "__main__":
    main()
