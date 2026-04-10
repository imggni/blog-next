---
name: git-commit
description: 生成规范、清晰、符合 Angular 风格的 Git 提交信息
---

# 目标
为 `blog-next` 项目生成符合 Angular 提交规范的 Git 提交信息，保持提交标题简洁明了，必要时补充准确的 commit body。

# 适用范围
- 功能开发、Bug 修复、样式调整、重构、文档更新、构建配置等所有常见改动
- 建议在代码变更说明、合并请求、提交历史中使用

# 提交类型
- feat: 新功能
- fix: 修复 Bug
- ui: 界面样式/视觉优化（shadcn / Tailwind）
- refactor: 代码重构
- docs: 文档更新
- chore: 构建/工具配置
- style: 格式调整，不影响功能
- test: 测试相关
- perf: 性能优化
- build: 构建、依赖、脚本变更

# 格式规则
- 使用 Angular 风格：`<type>(<scope>): <description>`
- `scope` 可选，但建议包含变更目标，如 `mall`, `layout`, `product`, `nav` 等
- `description` 应简洁、现在时、动词开头
- 标题长度不超过 60 字符
- 若需要补充说明，标题后使用一个空行，再写 body
- body 可以包含变更原因、背景、影响范围、Issue 编号等

# 输出要求
- 只输出 commit message，不要额外生成无关内容
- 优先返回单行标题，必要时再输出标题 + 空行 + body
- 不要生成超过 3 段的 body 内容
- 若文件改动明显，可推荐合适 scope

# 示例
- feat(mall): 新增炫酷商城首页
- fix(mall): 修复热门分类卡片响应式布局
- ui(mall): 优化商城首页视觉风格
- refactor(mall): 调整商城首页组件结构
- docs(readme): 更新商城页面说明
- chore(deps): 升级 Tailwind 依赖

# 判断逻辑
- 如果改动涉及 UI 样式与交互，则优先使用 `ui`
- 如果是页面结构或逻辑调整，则使用 `feat` / `refactor`
- bug 修复、布局异常、渲染错误等使用 `fix`
- 仅修改文档则使用 `docs`
- 仅调整构建、工具或脚本则使用 `chore` 或 `build`
