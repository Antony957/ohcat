/**
 * 音频流管理器
 * 集成到 RTC 系统中，管理 AI 语音回复的顺序播放
 */

import { audioQueue, AudioQueue } from './AudioQueue';

interface AudioStreamOptions {
  enableQueue?: boolean;
  maxConcurrentStreams?: number;
  streamTimeout?: number;
  onSpeakingStateChange?: (isSpeaking: boolean) => void;
}

interface AudioStreamItem {
  id: string;
  stream: MediaStream | Blob | ArrayBuffer;
  timestamp: number;
  priority?: number;
  metadata?: {
    isAIResponse?: boolean;
    messageId?: string;
    userId?: string;
  };
}

export class AudioStreamManager {
  private activeStreams: Map<string, AudioStreamItem> = new Map();
  private streamQueue: AudioQueue;
  private options: Required<AudioStreamOptions>;
  private streamCounter: number = 0;

  constructor(options: AudioStreamOptions = {}) {
    this.options = {
      enableQueue: true,
      maxConcurrentStreams: 1, // 确保同时只播放一个流
      streamTimeout: 30000, // 30秒超时
      onSpeakingStateChange: () => {},
      ...options
    };

    // 使用专门的音频队列实例
    this.streamQueue = new AudioQueue({
      maxQueueSize: 10,
      onPlayStart: (item) => this.onStreamStart(item.id),
      onPlayEnd: (item) => this.onStreamEnd(item.id),
      onQueueEmpty: () => this.onQueueEmpty(),
      onError: (error, item) => this.onStreamError(error, item?.id)
    });
  }

  /**
   * 添加音频流到管理器
   */
  public addAudioStream(
    audioData: MediaStream | Blob | ArrayBuffer | string,
    metadata?: AudioStreamItem['metadata']
  ): string {
    const streamId = `stream_${++this.streamCounter}_${Date.now()}`;
    
    const streamItem: AudioStreamItem = {
      id: streamId,
      stream: audioData as any,
      timestamp: Date.now(),
      priority: metadata?.isAIResponse ? 10 : 5, // AI 回复优先级更高
      metadata
    };

    // 如果启用队列模式
    if (this.options.enableQueue) {
      return this.addToQueue(streamItem);
    } else {
      return this.playDirectly(streamItem);
    }
  }

  /**
   * 添加到队列
   */
  private addToQueue(streamItem: AudioStreamItem): string {
    // 检查是否超过最大并发数
    if (this.activeStreams.size >= this.options.maxConcurrentStreams) {
      console.log(`Adding stream ${streamItem.id} to queue (active: ${this.activeStreams.size})`);
      
      // 将音频数据转换为队列项格式
      const queueItem = {
        id: streamItem.id,
        audioData: this.convertToAudioData(streamItem.stream),
        priority: streamItem.priority,
        metadata: streamItem.metadata
      };

      this.streamQueue.enqueue(queueItem);
      return streamItem.id;
    } else {
      return this.playDirectly(streamItem);
    }
  }

  /**
   * 直接播放音频流
   */
  private playDirectly(streamItem: AudioStreamItem): string {
    console.log(`Playing stream directly: ${streamItem.id}`);
    
    this.activeStreams.set(streamItem.id, streamItem);

    // 设置超时清理
    setTimeout(() => {
      if (this.activeStreams.has(streamItem.id)) {
        console.warn(`Stream ${streamItem.id} timed out`);
        this.removeStream(streamItem.id);
      }
    }, this.options.streamTimeout);

    // 处理不同类型的音频数据
    if (streamItem.stream instanceof MediaStream) {
      this.playMediaStream(streamItem);
    } else {
      // 对于 Blob 或 ArrayBuffer，使用音频队列播放
      const queueItem = {
        id: streamItem.id,
        audioData: this.convertToAudioData(streamItem.stream),
        priority: streamItem.priority,
        metadata: streamItem.metadata
      };
      this.streamQueue.enqueue(queueItem);
    }

    return streamItem.id;
  }

  /**
   * 播放 MediaStream
   */
  private playMediaStream(streamItem: AudioStreamItem): void {
    if (!(streamItem.stream instanceof MediaStream)) return;

    const audio = new Audio();
    audio.srcObject = streamItem.stream;
    
    audio.addEventListener('ended', () => {
      this.onStreamEnd(streamItem.id);
    });
    
    audio.addEventListener('error', (error) => {
      this.onStreamError(new Error('MediaStream playback failed'), streamItem.id);
    });

    audio.play().catch((error) => {
      this.onStreamError(error, streamItem.id);
    });
  }

  /**
   * 转换音频数据格式
   */
  private convertToAudioData(stream: MediaStream | Blob | ArrayBuffer | string): Blob | ArrayBuffer | string {
    if (stream instanceof MediaStream) {
      // MediaStream 需要特殊处理，这里返回一个占位符
      // 实际应用中可能需要录制 MediaStream 为 Blob
      throw new Error('MediaStream should be handled separately');
    }
    return stream as Blob | ArrayBuffer | string;
  }

  /**
   * 手动触发说话状态（用于测试或模拟）
   */
  public triggerSpeakingState(isSpeaking: boolean): void {
    console.log(`Manually triggering speaking state: ${isSpeaking}`);
    this.options.onSpeakingStateChange?.(isSpeaking);
  }

  /**
   * 流开始播放回调
   */
  private onStreamStart(streamId: string): void {
    console.log(`Audio stream started: ${streamId}`);
    const streamItem = this.activeStreams.get(streamId);
    if (streamItem?.metadata?.isAIResponse) {
      console.log('AI response playback started');
      // 通知说话状态改变
      this.options.onSpeakingStateChange?.(true);
    }
  }

  /**
   * 流播放结束回调
   */
  private onStreamEnd(streamId: string): void {
    console.log(`Audio stream ended: ${streamId}`);
    const streamItem = this.activeStreams.get(streamId);
    if (streamItem?.metadata?.isAIResponse) {
      console.log('AI response playback ended');
      // 检查是否还有其他 AI 回复在播放
      const hasOtherAIResponse = Array.from(this.activeStreams.values())
        .some(item => item.id !== streamId && item.metadata?.isAIResponse);
      
      if (!hasOtherAIResponse) {
        // 通知说话状态改变为停止
        this.options.onSpeakingStateChange?.(false);
      }
    }
    this.removeStream(streamId);
  }

  /**
   * 队列空回调
   */
  private onQueueEmpty(): void {
    console.log('All audio streams have finished playing');
    // 当队列为空时，确保说话状态为停止
    this.options.onSpeakingStateChange?.(false);
  }

  /**
   * 流错误回调
   */
  private onStreamError(error: Error, streamId?: string): void {
    console.error('Audio stream error:', error, streamId);
    if (streamId) {
      this.removeStream(streamId);
    }
  }

  /**
   * 移除流
   */
  private removeStream(streamId: string): void {
    this.activeStreams.delete(streamId);
    console.log(`Stream ${streamId} removed. Active streams: ${this.activeStreams.size}`);
  }

  /**
   * 停止所有音频流
   */
  public stopAllStreams(): void {
    console.log('Stopping all audio streams');
    this.streamQueue.stop();
    this.activeStreams.clear();
  }

  /**
   * 暂停所有音频流
   */
  public pauseAllStreams(): void {
    console.log('Pausing all audio streams');
    this.streamQueue.pause();
  }

  /**
   * 恢复所有音频流
   */
  public resumeAllStreams(): void {
    console.log('Resuming all audio streams');
    this.streamQueue.resume();
  }

  /**
   * 跳过当前播放的音频
   */
  public skipCurrentStream(): void {
    console.log('Skipping current audio stream');
    this.streamQueue.skip();
  }

  /**
   * 获取管理器状态
   */
  public getStatus() {
    return {
      activeStreams: this.activeStreams.size,
      queueStatus: this.streamQueue.getStatus(),
      options: this.options
    };
  }

  /**
   * 清空队列
   */
  public clearQueue(): void {
    this.streamQueue.clearQueue();
  }

  /**
   * 设置最大并发流数
   */
  public setMaxConcurrentStreams(max: number): void {
    this.options.maxConcurrentStreams = max;
  }

  /**
   * 检查是否正在播放 AI 回复
   */
  public isPlayingAIResponse(): boolean {
    for (const stream of this.activeStreams.values()) {
      if (stream.metadata?.isAIResponse) {
        return true;
      }
    }
    return false;
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.stopAllStreams();
    this.streamQueue.destroy();
    this.activeStreams.clear();
  }
}

// 说话状态变化回调数组
const speakingStateCallbacks: Array<(isSpeaking: boolean) => void> = [];

// 导出单例实例
export const audioStreamManager = new AudioStreamManager({
  enableQueue: true,
  maxConcurrentStreams: 1, // 确保顺序播放
  streamTimeout: 30000,
  onSpeakingStateChange: (isSpeaking: boolean) => {
    // 通知所有注册的回调
    speakingStateCallbacks.forEach(callback => callback(isSpeaking));
  }
});

// 注册说话状态变化回调
export const registerSpeakingStateCallback = (callback: (isSpeaking: boolean) => void): (() => void) => {
  speakingStateCallbacks.push(callback);
  
  // 返回取消注册函数
  return () => {
    const index = speakingStateCallbacks.indexOf(callback);
    if (index > -1) {
      speakingStateCallbacks.splice(index, 1);
    }
  };
};