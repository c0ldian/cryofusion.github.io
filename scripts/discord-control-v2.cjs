#!/usr/bin/env node
// Ultra-simple: single action row (no nested containers)

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
      pid: pidMatch ? pidMatch[1] : null
    }
  } catch (e) {
    return { running: false, pid: null }
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
      guildId: Object.keys(discordCfg?.guilds || {})[0] || null
    }
  } catch (e) {
    return { enabled: false, guildId: null }
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

// Build
const status = getGatewayStatus()
const discord = getDiscordChannel()
const cronJobs = getCronJobs()

const message = [
  '## 🧊 OpenClaw 控制面板',
  '',
  `**网关状态**: ${status.running ? '🟢 运行中' : '🔴 停止'}${status.pid ? ` (PID ${status.pid})` : ''}`,
  '',
  '**通道状态**',
  `- Discord: ${discord.enabled ? '✅' : '❌'}`,
  `- Guild: \`${discord.guildId || 'N/A'}\``,
  '',
  '**计划任务**',
  ...(cronJobs.length > 0
    ? cronJobs.map(job => `- **${job.name}**: ${job.schedule} (下次: ${job.next || 'N/A'})`)
    : ['无任务']),
  '',
  '点击下方按钮执行操作'
].join('\n')

// Components: action row with buttons (top-level array of component objects)
const components = [
  {
    type: "action-row",
    components: [
      { type: "button", custom_id: "gateway_restart", label: "重启网关", style: "primary" },
      { type: "button", custom_id: "heartbeat_check", label: "心跳检查", style: "secondary" },
      { type: "button", custom_id: "gateway_status_full", label: "状态详情", style: "secondary" }
    ]
  }
]

console.log(JSON.stringify({ message, components }, null, 2))
