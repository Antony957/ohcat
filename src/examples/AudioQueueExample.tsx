/**
 * 音频队列使用示例
 * 演示如何使用音频队列管理器确保音频流顺序播放
 */

import React, { useState, useEffect } from 'react';
import { audioQueue } from '@/lib/AudioQueue';
import { audioStreamManager } from '@/lib/AudioStreamManager';
import RTCClient from '@/lib/RtcClient';

const AudioQueueExample: React.FC = () => {
  const [queueStatus, setQueueStatus] = useState<any>({});
  const [streamStatus, setStreamStatus] = useState<any>({});
  const [isPlaying, setIsPlaying] = useState(false);

  // 更新状态
  const updateStatus = () => {
    setQueueStatus(audioQueue.getStatus());
    setStreamStatus(audioStreamManager.getStatus());
    setIsPlaying(RTCClient.isPlayingAIResponse());
  };

  useEffect(() => {
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // 模拟添加音频流
  const addSampleAudio = async (audioUrl: string, isAI: boolean = false) => {
    try {
      // 方法1: 直接使用音频队列
      audioQueue.enqueue({
        id: `audio_${Date.now()}`,
        audioData: audioUrl,
        priority: isAI ? 10 : 5,
        metadata: { isAIResponse: isAI }
      });

      // 方法2: 使用 RTC 客户端的方法
      // RTCClient.addAudioStream(audioUrl, isAI);
    } catch (error) {
      console.error('添加音频失败:', error);
    }
  };

  // 模拟 AI 回复音频
  const simulateAIResponse = () => {
    const responses = [
      'https://example.com/ai-response-1.mp3',
      'https://example.com/ai-response-2.mp3',
      'https://example.com/ai-response-3.mp3'
    ];

    responses.forEach((url, index) => {
      setTimeout(() => {
        addSampleAudio(url, true);
      }, index * 500); // 模拟连续的 AI 回复
    });
  };

  // 模拟用户音频
  const simulateUserAudio = () => {
    addSampleAudio('https://example.com/user-audio.mp3', false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">音频队列管理示例</h1>
      
      {/* 控制按钮 */}
      <div className="mb-6 space-x-2">
        <button
          onClick={simulateAIResponse}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          模拟 AI 回复
        </button>
        <button
          onClick={simulateUserAudio}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          模拟用户音频
        </button>
        <button
          onClick={() => audioQueue.pause()}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          暂停
        </button>
        <button
          onClick={() => audioQueue.resume()}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          恢复
        </button>
        <button
          onClick={() => audioQueue.skip()}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          跳过
        </button>
        <button
          onClick={() => audioQueue.stop()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          停止全部
        </button>
      </div>

      {/* 状态显示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 音频队列状态 */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">音频队列状态</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">队列长度:</span> {queueStatus.queueLength || 0}
            </div>
            <div>
              <span className="font-medium">正在播放:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                queueStatus.isPlaying ? 'bg-green-200 text-green-800' : 'bg-gray-200'
              }`}>
                {queueStatus.isPlaying ? '是' : '否'}
              </span>
            </div>
            <div>
              <span className="font-medium">当前项:</span> {queueStatus.currentItem?.id || '无'}
            </div>
            <div>
              <span className="font-medium">音频上下文:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                queueStatus.hasAudioContext ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {queueStatus.hasAudioContext ? '可用' : '不可用'}
              </span>
            </div>
          </div>
        </div>

        {/* 音频流管理器状态 */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">音频流管理器状态</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">活跃流数:</span> {streamStatus.activeStreams || 0}
            </div>
            <div>
              <span className="font-medium">正在播放 AI 回复:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                isPlaying ? 'bg-blue-200 text-blue-800' : 'bg-gray-200'
              }`}>
                {isPlaying ? '是' : '否'}
              </span>
            </div>
            <div>
              <span className="font-medium">队列状态:</span> {streamStatus.queueStatus?.queueLength || 0} 项
            </div>
            <div>
              <span className="font-medium">最大并发流:</span> {streamStatus.options?.maxConcurrentStreams || 1}
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">使用说明</h3>
        <ul className="text-sm space-y-1">
          <li>• 音频队列确保音频流按顺序播放，避免重叠</li>
          <li>• AI 回复具有更高的优先级，会优先播放</li>
          <li>• 支持暂停、恢复、跳过和停止操作</li>
          <li>• 自动管理音频上下文，适配移动端</li>
          <li>• 集成到 RTC 系统中，无需额外配置</li>
        </ul>
      </div>

      {/* 代码示例 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">代码示例</h3>
        <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`// 添加 AI 回复音频
RTCClient.addAudioStream(audioBlob, true);

// 添加用户音频
RTCClient.addAudioStream(audioUrl, false);

// 控制播放
RTCClient.pauseAllAudioStreams();
RTCClient.resumeAllAudioStreams();
RTCClient.skipCurrentAudioStream();

// 检查状态
const isPlayingAI = RTCClient.isPlayingAIResponse();
const status = RTCClient.getAudioStreamStatus();`}
        </pre>
      </div>
    </div>
  );
};

export default AudioQueueExample;