---
name: git-commit
description: 生成规范、清晰、符合 Angular 风格的 Git 提交信息
---

# Git Commit 规范
使用 Angular 提交规范：
<类型>(<范围>): <描述>

## 类型
- feat: 新功能
- fix: 修复 Bug
- ui: 界面样式调整（shadcn / Tailwind）
- refactor: 代码重构
- docs: 文档更新
- chore: 构建/工具配置
- style: 格式调整
- test: 测试

## 示例
- feat(products): 添加商品列表页面
- ui(button): 使用 shadcn Button 组件优化样式
- fix(layout): 修复导航栏响应式问题
- refactor: 优化页面组件结构

## 规则
- 简短清晰，不超过 60 字符
- 使用英文或中文均可
- 必须符合 <类型>: <描述> 格式