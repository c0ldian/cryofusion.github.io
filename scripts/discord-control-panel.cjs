#!/usr/bin/env node
// OpenClaw Control Panel for Discord (Components v2)
// Outputs Carbon v2 components JSON

const fs = require('fs')
const cp = require('child_process')
const path = require('path')

// 1. 收集状态
function getGatewayStatus() {
  try {
    const out = cp.execSync('openclaw gateway status', { encoding: 'utf-8' })
    const lines = out.split('\n')
    const runtimeLine = lines.find(l => l.includes('Runtime:'))
    const pidMatch = lines.find(l => l.includes('PID'))?.match(/PID (\d+)/)
    return {
      running: runtimeLine?.includes('running'),
      pid: pidMatch ? pidMatch[1] : null,
      port: 18789
    }
  } catch (e) {
    return { running: false, pid: null, port: 18789 }
  }
}

function getDiscordChannel() {
  const cfgPath = path.join(process.env.HOME, '.openclaw/openclaw.json')
  try {
    const cfgRaw = fs.readFileSync(cfgPath, 'utf-8')
    const cfg = JSON.parse(cfgRaw)
    const discordCfg = cfg.channels?.discord
    return {
      enabled: discordCfg?.enabled ?? false,
      guildId: Object.keys(discordCfg?.guilds || {})[0] || null,
      channelId: '1476467132811448482'
    }
  } catch (e) {
    return { enabled: false, guildId: null, channelId: null }
  }
}

function getRecentLog(lines = 3) {
  const logPath = '/Users/openclaw/.openclaw/logs/gateway.log'
  try {
    const content = fs.readFileSync(logPath, 'utf-8')
    const allLines = content.split('\n').filter(l => l.trim())
    return allLines.slice(-lines).reverse()
  } catch (e) {
    return [`无法读取日志: ${e.message}`]
  }
}

function getCronJobs() {
  try {
    const out = cp.execSync('openclaw cron list --json', { encoding: 'utf-8' })
    return JSON.parse(out)
  } catch (e) {
    return []
  }
}

// 2. 构建 Components v2 (Carbon schema)
function buildPanel() {
  const status = getGatewayStatus()
  const discord = getDiscordChannel()
  const logLines = getRecentLog(3)
  const cronJobs = getCronJobs()

  const components = [
    {
      type: "container",
      components: [
        { type: "text-display", content: "## 🧊 OpenClaw 控制面板" },
        { type: "text-display", content: `网关状态: **${status.running ? '🟢 运行中' : '🔴 停止'}**${status.pid ? ` (PID ${status.pid})` : ''}` }
      ]
    },
    { type: "separator", spacing: "small" },
    {
      type: "container",
      components: [
        { type: "text-display", content: "**快速操作**" },
        {
          type: "horizontal-container",
          components: [
            { type: "button", label: "重启网关", style: "primary", custom_id: "gateway_restart" },
            { type: "button", label: "心跳检查", style: "secondary", custom_id: "heartbeat_check" },
            { type: "button", label: "状态详情", style: "secondary", custom_id: "gateway_status_full" }
          ]
        }
      ]
    },
    {
      type: "container",
      components: [
        { type: "text-display", content: "**通道状态**" },
        {
          type: "horizontal-container",
          components: [
            { type: "text-display", content: `Discord: ${discord.enabled ? '✅' : '❌'}` },
            { type: "text-display", content: `Guild: \`${discord.guildId || 'N/A'}\`` },
            { type: "text-display", content: `Channel: \`${discord.channelId}\`` }
          ]
        }
      ]
    },
    {
      type: "container",
      components: [
        { type: "text-display", content: "**计划任务**" },
        ...(cronJobs.length > 0
          ? cronJobs.map(job => ({
              type: "text-display",
              content: `- **${job.name}**: ${job.schedule} (下次: ${job.next})`
            }))
          : [{ type: "text-display", content: "无任务" }])
      ]
    },
    {
      type: "container",
      components: [
        { type: "text-display", content: "**最近日志 (gateway.log)**" },
        ...logLines.map(line => ({ type: "text-display", content: `\`\`\`\n${line}\n\`\`\``, flags: 1 }))
      ]
    },
    {
      type: "container",
      components: [
        { type: "text-display", content: "点击按钮执行操作（需实现回调）", flags: 32 }
      ]
    }
  ]

  return components
}

// 3. 输出
const panel = buildPanel()
console.log(JSON.stringify({ components: panel }, null, 2))
