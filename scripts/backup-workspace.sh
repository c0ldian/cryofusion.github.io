#!/bin/bash
# Workspace backup script
# Creates daily, weekly, monthly backups of the OpenClaw workspace

set -e

WORKSPACE="/Users/openclaw/.openclaw/workspace"
BACKUP_HOME="$HOME/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DATE_TAG=$(date +"%Y-%m-%d")
WEEK_TAG=$(date +"%Y-%V")  # ISO week number
MONTH_TAG=$(date +"%Y-%m")

# Ensure backup home exists
mkdir -p "$BACKUP_HOME"

# Create tarball (exclude node_modules, .git, cache)
TAR_NAME="workspace-backup-$TIMESTAMP.tar.gz"
tar -czf "$BACKUP_HOME/$TAR_NAME" \
  -C "$(dirname "$WORKSPACE")" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='.vite' \
  --exclude='.idea' \
  --exclude='.DS_Store' \
  "$(basename "$WORKSPACE")"

# Symlinks for rotation
ln -sf "$TAR_NAME" "$BACKUP_HOME/latest.tar.gz"
rm -f "$BACKUP_HOME/daily/$DATE_TAG.tar.gz" 2>/dev/null || true
ln -s "../$TAR_NAME" "$BACKUP_HOME/daily/$DATE_TAG.tar.gz"
rm -f "$BACKUP_HOME/weekly/week-$WEEK_TAG.tar.gz" 2>/dev/null || true
ln -s "../$TAR_NAME" "$BACKUP_HOME/weekly/week-$WEEK_TAG.tar.gz"
rm -f "$BACKUP_HOME/monthly/month-$MONTH_TAG.tar.gz" 2>/dev/null || true
ln -s "../$TAR_NAME" "$BACKUP_HOME/monthly/month-$MONTH_TAG.tar.gz"

# Prune old backups (keep last 30 daily, 12 weekly, 12 monthly)
find "$BACKUP_HOME/daily" -type l -mtime +30 -delete 2>/dev/null || true
find "$BACKUP_HOME/weekly" -type l -mtime +90 -delete 2>/dev/null || true
find "$BACKUP_HOME/monthly" -type l -mtime +365 -delete 2>/dev/null || true

echo "✅ Backup created: $TAR_NAME"
echo "   Size: $(du -h "$BACKUP_HOME/$TAR_NAME" | cut -f1)"
echo "   Daily:   $BACKUP_HOME/daily/$DATE_TAG.tar.gz"
echo "   Weekly:  $BACKUP_HOME/weekly/week-$WEEK_TAG.tar.gz"
echo "   Monthly: $BACKUP_HOME/monthly/month-$MONTH_TAG.tar.gz"
