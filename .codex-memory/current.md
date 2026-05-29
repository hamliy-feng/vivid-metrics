<!-- codex-memory:template=current:v1 -->

# 当前目标

- `vivid-metrics` 已发布为可公开分享的 GitHub Pages 页面，核心分享页为 `/vivid-metrics/rankings/`。

# 范围 / 不做

- 做：检查静态导出配置、GitHub Pages 工作流、远端仓库状态、构建结果和线上页面效果。
- 不做：公开原始 Excel 数据或引入需要后端/数据库的运行依赖。

# 当前状态

- 已完成：GitHub Actions 部署成功；线上链接 `https://hamliy-feng.github.io/vivid-metrics/rankings/` 可访问；桌面和 390px 手机视口均已通过视觉和资源检查。
- 进行中：无。
- 未开始：无。

# 稳定约束

- 默认使用中文沟通。
- 发布后必须验证页面不只是文字空壳，视觉效果、样式资源和图表资源需要正常加载。
- 不要公开 `.env` 或原始账号数据表，除非用户明确授权。

# 关键索引

- 活跃任务：无独立任务目录；当前线程内处理 GitHub Pages 发布。
- 关键页面 / 模块：`/vivid-metrics/rankings`
- 关键文件 / 路径：`next.config.ts`、`.github/workflows/deploy.yml`、`src/app/rankings/page.tsx`
- 关键节点 / 资源：GitHub 仓库 `hamliy-feng/vivid-metrics`、GitHub Pages、最新已部署提交 `9a831fd`

# 风险 / 下一步

- 风险：远端同名仓库未能删除重建，因为当前 GitHub CLI token 缺少 `delete_repo` scope；已复用同名公开仓库完成发布，不影响分享链接。
- 下一步：若用户仍要求删除重建仓库，需要先执行 `gh auth refresh -h github.com -s delete_repo` 并在浏览器完成授权。
