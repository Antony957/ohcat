#!/bin/bash

# 修正版：直接压缩并替换原视频的脚本 (无音频版本)
# 会先备份原文件到 /opt/ohcat/public/videos_backup

VIDEO_DIR="/opt/ohcat/public/videos"
BACKUP_DIR="/opt/ohcat/public/videos_backup"

echo "开始压缩并替换视频文件..."
echo "原始目录: $VIDEO_DIR"
echo "备份目录: $BACKUP_DIR"

# 创建备份目录
sudo mkdir -p "$BACKUP_DIR"

# 询问用户确认
echo ""
echo "⚠️  警告：此操作将直接替换原视频文件！"
echo "原文件将备份到: $BACKUP_DIR"
echo ""
read -p "确定要继续吗？(y/N): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo "开始处理..."
    
    # 遍历所有视频文件
    for person_dir in "$VIDEO_DIR"/*; do
        if [ -d "$person_dir" ]; then
            person_name=$(basename "$person_dir")
            echo ""
            echo "处理 $person_name 的视频..."
            
            # 创建对应的备份目录
            sudo mkdir -p "$BACKUP_DIR/$person_name"
            
            # 压缩该目录下的所有mp4文件
            for video_file in "$person_dir"/*.mp4; do
                if [ -f "$video_file" ]; then
                    # 备份路径
                    backup_path="$BACKUP_DIR/$person_name/$(basename "$video_file")"
                    
                    echo "正在处理: $(basename "$video_file")"
                    
                    # 备份原文件
                    sudo cp "$video_file" "$backup_path"
                    
                    # 压缩到临时文件 (修正：去掉音频参数)
                    temp_file="${video_file}.tmp"
                    ffmpeg -i "$video_file" \
                        -c:v libx264 -crf 28 -preset fast \
                        -vf "scale=640:1136" -r 30 \
                        -movflags +faststart \
                        -an \
                        -y "$temp_file" 2>/dev/null
                    
                    if [ $? -eq 0 ]; then
                        # 获取文件大小
                        orig_size=$(stat -c%s "$video_file")
                        new_size=$(stat -c%s "$temp_file")
                        
                        # 替换原文件
                        sudo mv "$temp_file" "$video_file"
                        
                        echo "✓ 完成: $(basename "$video_file")"
                        echo "  原始大小: $(numfmt --to=iec-i --suffix=B $orig_size)"
                        echo "  压缩后: $(numfmt --to=iec-i --suffix=B $new_size)"
                    else
                        echo "✗ 失败: $(basename "$video_file")"
                        rm -f "$temp_file"
                    fi
                fi
            done
        fi
    done
    
    echo ""
    echo "🎉 压缩完成！"
    echo "所有原文件已备份到: $BACKUP_DIR"
    echo ""
    echo "如需恢复原文件，运行以下命令："
    echo "sudo cp -r $BACKUP_DIR/* $VIDEO_DIR/"
    
else
    echo "操作已取消"
fi
