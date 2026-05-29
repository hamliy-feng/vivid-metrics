<!-- codex-memory:template=archive-entry:v1 -->

# 2026-05-30 归档

## 本轮完成

- 将 `vivid-metrics` 推送到公开 GitHub 仓库 `hamliy-feng/vivid-metrics`。
- GitHub Actions run `26654736219` 成功完成 build 和 deploy。
- 公开分享页已上线：`https://hamliy-feng.github.io/vivid-metrics/rankings/`。

## 关键调整

- `next.config.ts` 保持静态导出，补充 `trailingSlash: true`，适配 GitHub Pages 目录式 URL。
- `.github/workflows/deploy.yml` 增加手动触发、Pages 配置、lint、build 和静态导出校验，并在产物中写入 `.nojekyll`。
- `src/app/rankings/page.tsx` 调整移动端头部和榜单卡片响应式布局，避免窄屏数值区被挤出。
- `src/components/nav/AppNav.tsx` 和排行榜详情链接关闭预取，避免 GitHub Pages 静态环境出现 RSC 预取 404。
- 修复若干既有 ESLint 问题，包括未使用变量和 `any` 类型。

## 为什么这样改

- 用户要求分享后的页面保持本地精美程度，不能出现只有少量文字、样式或脚本丢失的情况。
- GitHub Pages 项目路径需要 `/vivid-metrics` base path 和目录式静态页面共同保证资源可访问。
- 关闭预取可以减少 Next 静态导出在 GitHub Pages 上的无意义后台请求错误。

## 后续影响

- 推送到 `master` 会自动重新部署 GitHub Pages。
- README 的分享入口和仓库 homepage 都指向排行榜页。
- 远端同名仓库没有删除重建，因为当前 GitHub CLI token 缺少 `delete_repo` scope；已复用公开仓库发布。

## 相关主题

- GitHub Pages 发布
- Next.js 静态导出
- 排行榜页移动端验证
