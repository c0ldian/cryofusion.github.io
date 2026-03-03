# Quantumult X → Clash 配置转换完成

## 📦 输出文件

| 文件 | 用途 | 说明 |
|------|------|------|
| `clash-config.yaml` | 主配置 | 包含代理组、规则、dns 等核心设置 |
| `clash-nodes.yaml` | 节点列表（占位） | 实际节点通过 `proxy-providers` 从订阅获取 |
| `clash-rules.yaml` | 规则集 | 可直接引用或合并到主配置 |
| `clash-rewrite.yaml` | 重写规则 | URL 重写规则（待完善） |

## 🔄 转换逻辑

1. **节点**：保留原 `server_remote` 的两个订阅（yiyo26、zju1），转为 `proxy-providers`
2. **策略组**：原 `policy` 中的静态组 → `proxy-groups`（select 类型）
3. **规则**：`filter_local` 直接转换 + `filter_remote` 引用（建议单独管理）
4. **重写**：`rewrite_local` 单条转换，其余待手动处理

## ⚙️ 使用方法

### 1. 安装 Clash 核心（如 Clash.Meta）
- 下载：https://github.com/MetaCubeX/Clash.Meta/releases

### 2. 准备订阅转换
原配置的订阅 URL 是 Quantumult X 格式，需要先转为 Clash 格式：

```bash
# 推荐工具
# - Sub-Store: https://substore.vercel.app/
# - ACL4SSR: https://acl4ssr-sub.github.io/
```

转换后，得到 Clash 格式的节点列表（YAML 或 Base64）。

### 3. 填入节点

选项 A（手动）：将转换后的节点粘贴到 `clash-nodes.yaml` 的 `proxies:` 下。

选项 B（自动）：保留 `proxy-providers`，让 Clash 定期从订阅 URL 拉取（需订阅支持 Clash 格式）。

### 4. 合并配置

将 `clash-config.yaml`、`clash-rules.yaml`、`clash-rewrite.yaml` 合并为一个完整配置文件，或使用 `rule-providers` 外部引用。

## 🎯 优化建议

1. **订阅转换**：将两个订阅 URL 全部转为 Clash 格式，合并节点并去重
2. **规则精简**：原配置规则较多，可按需删减（例如只保留常用分类）
3. **代理组调整**：当前 `自动测速` 组使用 `url-test`，其他 `select` 组可改为 `url-test` 实现自动选择
4. **重写完善**：将 `rewrite_remote` 中的脚本转换为 Clash 的 `script` 或 `url-regex` 规则
5. **DNS 配置**：可根据需要添加 `enhance-mode: redir-host` 或 `fake-ip-range`

## 📝 注意事项

- 原配置中的 `force-policy`（如 `force-policy=direct`）已转换为 Clash 规则
- `final, 黑白名单` 表示最终匹配到 “黑白名单” 策略组，已保留
- `geoip, jp, 全球加速` 等地理规则已转为 `GEOIP,JP,全球加速`
- 部分 `host` 规则中的 `proxy` 保留，但需对应到具体节点组名
- `rewrite` 规则未完全转换，需要根据实际需求补充

## 🚀 下一步

如需我：
- 帮你把 `rewrite_remote` 所有规则完整转换
- 生成一个可直接导入 Clash 的单一配置文件
- 创建自动化脚本定期更新订阅和规则

请告诉我，我可以继续完善。
