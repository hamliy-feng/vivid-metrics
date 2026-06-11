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

## 数据同步

默认从同级数据目录读取：

- `D:\3.数据分析\wechat-video`
- `D:\3.数据分析\xiaohongshu`

同步微信视频号和小红书数据：

```powershell
python scripts\sync-source-data.py
```

脚本会更新 `src/lib/data/real-wechat-data.json` 和 `src/lib/data/xhs-real.json`，并在 `src/lib/data/source-sync-report.json` 记录已导入和未映射的数据源。快手、抖音和公众号数据不会被这个脚本更新。

脚本同时支持在 `scripts/sync-source-data.py` 里配置散放的最新导出文件；如果视频号文件无法和既有账号匹配，可作为 `cheat-*` 并列账号进入大屏，等确认真实账号名后再改映射。

## 发布

推送到 `master` 后，GitHub Actions 会自动构建静态页面并发布到 GitHub Pages。发布流程会检查：

- `out/rankings/index.html` 已生成
- `_next/static` 资源已生成
- 页面资源路径包含 `/vivid-metrics/_next/static`

这些检查用于避免线上页面只剩文字、样式或脚本资源丢失。
