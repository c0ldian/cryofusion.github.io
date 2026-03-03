#!/usr/bin/env node
// OpenClaw Control Panel for Discord (Simplified Components v2)
// Compatible with standard Discord clients

const fs = require('fs')
const cp = require('child_process')
const path = require('path')

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

function buildPanel() {
  const status = getGatewayStatus()
  const discord = getDiscordChannel()
  const logLines = getRecentLog(3)
  const cronJobs = getCronJobs()

  // 使用 flat components: text rows + action rows
  const components = []

  // 1. Header (text)
  components.push({ type: "text-display", content: "## 🧊 OpenClaw 控制面板" })
  components.push({ type: "text-display", content: `**网关状态**: ${status.running ? '🟢 运行中' : '🔴 停止'}${status.pid ? ` (PID ${status.pid})` : ''}` })

  // 2. Separator
  components.push({ type: "separator", spacing: "small" })

  // 3. Buttons (action row)
  components.push({
    type: "horizontal-container",
    components: [
      { type: "button", label: "重启网关", style: "primary", custom_id: "gateway_restart" },
      { type: "button", label: "心跳检查", style: "secondary", custom_id: "heartbeat_check" },
      { type: "button", label: "状态详情", style: "secondary", custom_id: "gateway_status_full" }
    ]
  })

  // 4. Channel info (text)
  components.push({ type: "text-display", content: "**通道状态**" })
  components.push({ type: "text-display", content: `Discord: ${discord.enabled ? '✅' : '❌'}` })
  components.push({ type: "text-display", content: `Guild: \`${discord.guildId || 'N/A'}\`` })
  components.push({ type: "text-display", content: `Channel: \`${discord.channelId}\`` })

  // 5. Separator
  components.push({ type: "separator", spacing: "small" })

  // 6. Cron jobs
  components.push({ type: "text-display", content: "**计划任务**" })
  if (cronJobs.length > 0) {
    cronJobs.forEach(job => {
      components.push({ type: "text-display", content: `- **${job.name}**: ${job.schedule} (下次: ${job.next || 'N/A'})` })
    })
  } else {
    components.push({ type: "text-display", content: "无任务" })
  }

  // 7. Separator
  components.push({ type: "separator", spacing: "small" })

  // 8. Log entries (mono)
  components.push({ type: "text-display", content: "**最近日志 (gateway.log)**" })
  logLines.forEach(line => {
    components.push({ type: "text-display", content: `\`\`\`\n${line}\n\`\`\``, flags: 1 })
  })

  // 9. Footer
  components.push({ type: "text-display", content: "点击按钮执行操作（需配置回调）", flags: 32 })

  return components
}

const panel = buildPanel()
console.log(JSON.stringify({ components: panel }, null, 2))
