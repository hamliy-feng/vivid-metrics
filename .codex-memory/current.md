<!-- codex-memory:template=current:v1 -->

# 当前目标

- 将 `vivid-metrics` 发布为可公开分享的 GitHub Pages 页面，重点保证 `/vivid-metrics/rankings` 在线访问效果与本地 `localhost:3000/vivid-metrics/rankings` 一致。

# 范围 / 不做

- 做：检查静态导出配置、GitHub Pages 工作流、远端仓库状态、构建结果和线上页面效果。
- 不做：公开原始 Excel 数据或引入需要后端/数据库的运行依赖。

# 当前状态

- 已完成：确认本地 GitHub 登录账号为 `hamliy-feng`；项目为 Next.js 静态导出，`basePath` 为 `/vivid-metrics`。
- 进行中：整理 GitHub Pages 发布链路并做多轮本地/线上验证。
- 未开始：远端仓库重建或清理、推送、Pages 部署确认。

# 稳定约束

- 默认使用中文沟通。
- 发布后必须验证页面不只是文字空壳，视觉效果、样式资源和图表资源需要正常加载。
- 不要公开 `.env` 或原始账号数据表，除非用户明确授权。

# 关键索引

- 活跃任务：无独立任务目录；当前线程内处理 GitHub Pages 发布。
- 关键页面 / 模块：`/vivid-metrics/rankings`
- 关键文件 / 路径：`next.config.ts`、`.github/workflows/deploy.yml`、`src/app/rankings/page.tsx`
- 关键节点 / 资源：GitHub 仓库 `hamliy-feng/vivid-metrics`、GitHub Pages

# 风险 / 下一步

- 风险：GitHub Pages 若未正确启用 Actions 源，或静态资源路径/basePath 不匹配，线上页面可能只显示少量文字或样式丢失。
- 下一步：跑本地构建，检查导出文件和页面资源，再处理远端仓库并推送部署。
