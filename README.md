# VividMetrics

内容运营数据大屏，用于查看微信视频号、小红书、抖音、快手和公众号的跨平台运营表现。

## 在线访问

- 排行榜页面：https://hamliy-feng.github.io/vivid-metrics/rankings/
- 总览页面：https://hamliy-feng.github.io/vivid-metrics/

## 本地预览

```bash
bun install
bun dev
```

本地访问：

```text
http://localhost:3000/vivid-metrics/rankings
```

## 发布

推送到 `master` 后，GitHub Actions 会自动构建静态页面并发布到 GitHub Pages。发布流程会检查：

- `out/rankings/index.html` 已生成
- `_next/static` 资源已生成
- 页面资源路径包含 `/vivid-metrics/_next/static`

这些检查用于避免线上页面只剩文字、样式或脚本资源丢失。
