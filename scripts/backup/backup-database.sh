#!/bin/bash

# ============================================
# 数据库备份脚本
# 用途: 备份 PostgreSQL 数据库
# 使用: ./backup-database.sh
# ============================================

set -e

# 配置
DB_NAME="ecommerce_platform"
DB_USER="postgres"
DB_PASSWORD="postgres123"
BACKUP_DIR="/Users/qingfeng/Desktop/soft/dianshang1/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$DATE.sql.gz"

echo "========== 数据库备份开始 =========="
echo "数据库: $DB_NAME"
echo "备份时间: $DATE"

# 1. 创建备份目录
mkdir -p $BACKUP_DIR

# 2. 执行备份（带压缩）
echo "执行备份..."
PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_FILE

# 3. 验证备份
if [ $? -eq 0 ] && [ -f $BACKUP_FILE ]; then
  FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
  echo "✅ 数据库备份成功"
  echo "备份文件: $BACKUP_FILE"
  echo "文件大小: $FILE_SIZE"
else
  echo "❌ 数据库备份失败"
  exit 1
fi

# 4. 删除 7 天前的本地备份
echo "清理旧备份..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "========== 数据库备份完成 =========="
