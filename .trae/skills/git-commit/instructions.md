---
name: git-commit
description: 一键生成符合规范的Git提交信息，校验提交格式，修复不规范提交，触发关键词：git提交、生成git提交信息、git commit、git提交规范、校验git提交
---

# Git Commit 提交信息规范
遵循 Conventional Commits 标准，自动分析代码变更并生成规范的提交信息。

## 指令（执行规则）
1. 接收提交类型、描述、修改范围、详细说明，自动生成 **Angular 规范 Git 提交信息**
2. 严格校验格式，禁止不规范提交，自动修复格式/类型/长度问题
3. 固定格式：
   - 首行：类型(范围): 简短描述（≤50字符）
   - 空行
   - 详细说明（可选，每行≤72字符）
   - 空行
   - 关联 issues（可选）
4. 自动适配 Next.js / Express 项目场景
5. 支持历史提交校验 + 自动修复

## 提交类型（强制）
| 类型     | 说明                     | 适用场景                     |
|----------|--------------------------|------------------------------|
| feat     | 新增功能                 | 页面、组件、接口、路由       |
| fix      | 修复 bug                 | 渲染、接口、逻辑、样式问题   |
| docs     | 文档修改                 | 注释、规则、README           |
| style    | 代码格式（不影响功能）| 格式化、缩进、命名修正       |
| refactor | 重构（无功能无 bug 修复）| 组件拆分、逻辑优化、结构调整 |
| perf     | 性能优化                 | 图片、懒加载、接口优化       |
| test     | 测试用例                 | 单元测试、接口测试           |
| chore    | 构建/依赖/配置            | 依赖升级、配置修改           |
| revert   | 回滚提交                 | 撤销错误版本                 |

## 示例（基础）
feat(blog): add article list page

Implement server component for article list with pagination and search.
Optimize data fetching with next cache and suspense.

Closes #42