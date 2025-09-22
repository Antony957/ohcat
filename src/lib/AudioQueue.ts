/**
 * 音频队列管理器
 * 确保音频流按顺序播放，避免重叠
 */

interface AudioQueueItem {
  id: string;
  audioData: ArrayBuffer | Blob | string; // 支持不同音频数据格式
  priority?: number; // 优先级，数字越大优先级越高
  metadata?: Record<string, any>; // 额外元数据
}

interface AudioQueueOptions {
  maxQueueSize?: number;
  onPlayStart?: (item: AudioQueueItem) => void;
  onPlayEnd?: (item: AudioQueueItem) => void;
  onQueueEmpty?: () => void;
  onError?: (error: Error, item?: AudioQueueItem) => void;
}

export class AudioQueue {
  private queue: AudioQueueItem[] = [];
  private isPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private currentItem: AudioQueueItem | null = null;
  private audioContext: AudioContext | null = null;
  private options: AudioQueueOptions;

  constructor(options: AudioQueueOptions = {}) {
    this.options = {
      maxQueueSize: 10,
      ...options
    };
    this.initAudioContext();
  }

  /**
   * 初始化音频上下文
   */
  private async initAudioContext(): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        // 确保音频上下文处于运行状态
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      }
    } catch (error) {
      console.warn('Failed to initialize AudioContext:', error);
    }
  }

  /**
   * 添加音频到队列
   */
  public enqueue(item: AudioQueueItem): boolean {
    // 检查队列大小限制
    if (this.options.maxQueueSize && this.queue.length >= this.options.maxQueueSize) {
      console.warn('Audio queue is full, dropping oldest item');
      this.queue.shift(); // 移除最旧的项
    }

    // 添加到队列
    this.queue.push(item);

    // 按优先级排序（优先级高的在前）
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    console.log(`Audio item added to queue. Queue size: ${this.queue.length}`);

    // 如果当前没有播放，开始播放
    if (!this.isPlaying) {
      this.processNext();
    }

    return true;
  }

  /**
   * 处理队列中的下一个音频
   */
  private async processNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.options.onQueueEmpty?.();
      return;
    }

    if (this.isPlaying) {
      return; // 已在播放中，等待当前播放完成
    }

    const item = this.queue.shift();
    if (!item) return;

    this.currentItem = item;
    this.isPlaying = true;

    try {
      await this.playAudioItem(item);
    } catch (error) {
      console.error('Error playing audio item:', error);
      this.options.onError?.(error as Error, item);
      this.onPlaybackEnd();
    }
  }

  /**
   * 播放单个音频项
   */
  private async playAudioItem(item: AudioQueueItem): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.options.onPlayStart?.(item);

        if (typeof item.audioData === 'string') {
          // URL 形式的音频
          this.playAudioFromURL(item.audioData, resolve, reject);
        } else if (item.audioData instanceof Blob) {
          // Blob 形式的音频
          this.playAudioFromBlob(item.audioData, resolve, reject);
        } else if (item.audioData instanceof ArrayBuffer) {
          // ArrayBuffer 形式的音频
          this.playAudioFromArrayBuffer(item.audioData, resolve, reject);
        } else {
          reject(new Error('Unsupported audio data format'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 从 URL 播放音频
   */
  private playAudioFromURL(url: string, resolve: () => void, reject: (error: Error) => void): void {
    this.currentAudio = new Audio(url);
    this.setupAudioEvents(this.currentAudio, resolve, reject);
    this.currentAudio.play().catch(reject);
  }

  /**
   * 从 Blob 播放音频
   */
  private playAudioFromBlob(blob: Blob, resolve: () => void, reject: (error: Error) => void): void {
    const url = URL.createObjectURL(blob);
    this.currentAudio = new Audio(url);
    this.setupAudioEvents(this.currentAudio, resolve, reject);
    
    // 播放完成后清理 URL
    this.currentAudio.addEventListener('ended', () => {
      URL.revokeObjectURL(url);
    });
    
    this.currentAudio.play().catch(reject);
  }

  /**
   * 从 ArrayBuffer 播放音频
   */
  private async playAudioFromArrayBuffer(arrayBuffer: ArrayBuffer, resolve: () => void, reject: (error: Error) => void): Promise<void> {
    if (!this.audioContext) {
      reject(new Error('AudioContext not available'));
      return;
    }

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        resolve();
        this.onPlaybackEnd();
      };
      
      source.start();
    } catch (error) {
      reject(error as Error);
    }
  }

  /**
   * 设置音频事件监听器
   */
  private setupAudioEvents(audio: HTMLAudioElement, resolve: () => void, reject: (error: Error) => void): void {
    const onEnded = () => {
      resolve();
      this.onPlaybackEnd();
    };

    const onError = () => {
      reject(new Error('Audio playback failed'));
      this.onPlaybackEnd();
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
  }

  /**
   * 播放结束处理
   */
  private onPlaybackEnd(): void {
    if (this.currentItem) {
      this.options.onPlayEnd?.(this.currentItem);
    }

    // 清理当前播放状态
    this.currentAudio = null;
    this.currentItem = null;
    this.isPlaying = false;

    // 处理下一个音频
    setTimeout(() => this.processNext(), 50); // 小延迟确保清理完成
  }

  /**
   * 停止当前播放并清空队列
   */
  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    this.queue = [];
    this.isPlaying = false;
    this.currentItem = null;
  }

  /**
   * 暂停当前播放
   */
  public pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  /**
   * 恢复播放
   */
  public resume(): void {
    if (this.currentAudio) {
      this.currentAudio.play().catch((error) => {
        console.error('Failed to resume audio:', error);
        this.options.onError?.(error);
      });
    }
  }

  /**
   * 跳过当前播放的音频
   */
  public skip(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = this.currentAudio.duration || 0;
    }
  }

  /**
   * 获取队列状态
   */
  public getStatus() {
    return {
      queueLength: this.queue.length,
      isPlaying: this.isPlaying,
      currentItem: this.currentItem,
      hasAudioContext: !!this.audioContext
    };
  }

  /**
   * 清空队列（但不停止当前播放）
   */
  public clearQueue(): void {
    this.queue = [];
  }

  /**
   * 获取队列副本
   */
  public getQueue(): AudioQueueItem[] {
    return [...this.queue];
  }

  /**
   * 销毁音频队列
   */
  public destroy(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// 导出单例实例
export const audioQueue = new AudioQueue({
  maxQueueSize: 20,
  onPlayStart: (item) => {
    console.log('Audio playback started:', item.id);
  },
  onPlayEnd: (item) => {
    console.log('Audio playback ended:', item.id);
  },
  onQueueEmpty: () => {
    console.log('Audio queue is empty');
  },
  onError: (error, item) => {
    console.error('Audio queue error:', error, item);
  }
});