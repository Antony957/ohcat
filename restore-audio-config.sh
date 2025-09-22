#!/bin/bash

# 恢复音频配置脚本
# 用法: ./restore-audio-config.sh

echo "正在恢复原始音频配置..."

if [ -f "src/lib/catConfigs.ts.backup" ]; then
    cp src/lib/catConfigs.ts.backup src/lib/catConfigs.ts
    echo "✅ 已成功恢复原始音频配置"
    echo "所有角色的音频配置已恢复为各自的原始声音"
else
    echo "❌ 备份文件不存在，无法恢复"
    exit 1
fi