---
name: via54larkgroups-skill
description: Lark (Feishu) group collaboration and message broadcasting - automating group creation and document notifications for medical teams.
version: 1.0.0
---

# via54larkgroups · 飞书群组自动化协作技能

> 使用飞书企业开发开放 API，自动建立学术协作群聊（拉入核心专家与科研助手），并自动化广播富文本报告与集采政策提醒。

## When to Use

Use when:
- Creating a collaborative space for a new medical project.
- Broadcasting generated medical report summaries to multi-expert groups.
- Adding or removing expert IDs from communications channels.

## Implementation Guide

1. Setup Feishu App Credentials:
- Requires `LARK_APP_ID` and `LARK_APP_SECRET`.
- Calls tenant token API: `https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal`

2. Create Group Chat:
- Call API `/open-apis/im/v1/chats` with POST and body containing `name`, `members`.
