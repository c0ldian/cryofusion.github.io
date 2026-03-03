#!/bin/bash
# Weather check for Wenling
# Runs at 21:00 daily to check tomorrow's weather
# Notifies if tomorrow is NOT sunny OR temperature diff >= 7°C

set -e

# Wenling coordinates (approx)
LAT=28.36
LON=121.38
API_URL="https://api.open-meteo.com/v1/forecast?latitude=$LAT&longitude=$LON&daily=weathercode,temperature_2m_max&timezone=Asia/Shanghai"

TODAY=$(date +%Y-%m-%d)
TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "tomorrow" +%Y-%m-%d)
if [ -z "$TOMORROW" ]; then
  TOMORROW=$(date -v +1d +%Y-%m-%d 2>/dev/null || date -d "tomorrow" +%Y-%m-%d)
fi

LOG_FILE="$HOME/.openclaw/workspace/logs/weather-wenling.log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log "=== Weather check start ==="
log "City: Wenling (lat=$LAT, lon=$LON)"
log "Today: $TODAY, Tomorrow: $TOMORROW"

# Fetch weather data
RESPONSE=$(curl -s --connect-timeout 10 "$API_URL" 2>/dev/null) || {
  log "ERROR: Failed to fetch weather data"
  exit 1
}

# Check if response is valid JSON
echo "$RESPONSE" | jq empty 2>/dev/null || {
  log "ERROR: Invalid JSON response"
  exit 1
}

# Extract arrays into bash arrays
TIME_ARR=()
CODE_ARR=()
TMAX_ARR=()

# Read time array
while IFS= read -r line; do
  TIME_ARR+=("$line")
done < <(echo "$RESPONSE" | jq -r '.daily.time[]')

# Read weathercode array
while IFS= read -r line; do
  CODE_ARR+=("$line")
done < <(echo "$RESPONSE" | jq -r '.daily.weathercode[]')

# Read temperature array
while IFS= read -r line; do
  TMAX_ARR+=("$line")
done < <(echo "$RESPONSE" | jq -r '.daily.temperature_2m_max[]')

# Find indices for today and tomorrow
IDX_TODAY=-1
IDX_TOMORROW=-1
for i in "${!TIME_ARR[@]}"; do
  if [ "${TIME_ARR[$i]}" = "$TODAY" ]; then
    IDX_TODAY=$i
  fi
  if [ "${TIME_ARR[$i]}" = "$TOMORROW" ]; then
    IDX_TOMORROW=$i
  fi
done

if [ $IDX_TODAY -lt 0 ] || [ $IDX_TOMORROW -lt 0 ]; then
  log "ERROR: Could not find today/tomorrow in forecast (today_idx=$IDX_TODAY, tomorrow_idx=$IDX_TOMORROW)"
  log "Available dates: ${TIME_ARR[*]}"
  exit 1
fi

TODAY_MAX=${TMAX_ARR[$IDX_TODAY]}
TOMORROW_MAX=${TMAX_ARR[$IDX_TOMORROW]}
TOMORROW_CODE=${CODE_ARR[$IDX_TOMORROW]}

log "Today max temp: ${TODAY_MAX}°C"
log "Tomorrow max temp: ${TOMORROW_MAX}°C"
log "Tomorrow weather code: $TOMORROW_CODE"

# Compute difference (absolute)
DIFF_ABS=$(awk "BEGIN {diff=$TOMORROW_MAX - $TODAY_MAX; if (diff<0) diff=-diff; print diff}")
log "Temperature difference: ${DIFF_ABS}°C"

# Check conditions
NEEDS_NOTICE=false
REASON=""

# Condition 1: Tomorrow is NOT sunny (Open-Meteo: 0 = Clear)
if [ "$TOMORROW_CODE" -eq 0 ]; then
  log "Condition 1: Tomorrow is sunny/clear => OK"
else
  log "Condition 1: Tomorrow is NOT sunny/clear (code=$TOMORROW_CODE)"
  NEEDS_NOTICE=true
  REASON="明天不是晴天（天气代码 $TOMORROW_CODE）"
fi

# Condition 2: Temp diff >= 7
if (( $(awk "BEGIN {print ($DIFF_ABS >= 7)}") )); then
  log "Condition 2: Temp diff >= 7°C (actual: ${DIFF_ABS}°C)"
  if [ "$NEEDS_NOTICE" = true ]; then
    REASON="$REASON；同时 "
  fi
  REASON="$REASON今天与明天最高温差${DIFF_ABS}度"
  NEEDS_NOTICE=true
else
  log "Condition 2: Temp diff < 7°C (actual: ${DIFF_ABS}°C) => OK"
fi

if [ "$NEEDS_NOTICE" = true ]; then
  MSG="🖤 温岭天气提醒：$REASON。\n今天最高温：${TODAY_MAX}°C，明天最高温：${TOMORROW_MAX}°C"
  log "Sending notice: $MSG"
  /opt/homebrew/bin/openclaw message send --channel discord --target 1476471728258420807 --message "$MSG" --silent >/dev/null 2>&1 || {
    log "WARN: Failed to send message via OpenClaw"
  }
else
  log "No notice needed."
fi

log "=== Weather check end ==="
