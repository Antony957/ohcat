import { useState, useEffect, useRef, useCallback } from 'react';

interface AnimationPlayerProps {
  animationPath: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
  frameRate?: number;
  loop?: boolean;
  isSpeaking?: boolean;
  characterName?: string;
}

interface AnimationCache {
  [key: string]: HTMLImageElement[];
}

const AnimationPlayer = ({ 
  animationPath, 
  className = '',
  style,
  onError,
  frameRate = 24,
  loop = true,
  isSpeaking = false,
  characterName = ''
}: AnimationPlayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationCache, setAnimationCache] = useState<AnimationCache>({});
  const [currentAnimationPath, setCurrentAnimationPath] = useState<string>('');

  // 根据动画路径获取预期帧数
  const getExpectedFrameCount = (path: string): number => {
    if (path.includes('9-waiting')) return 240;
    if (path.includes('1-talk')) return 310;
    if (path.includes('speaking')) return 200; // 说话动画
    if (path.includes('idle')) return 200; // 待机动画
    return 200; // 默认值
  };

  // 根据角色名称和说话状态获取动画路径
  const getAnimationPath = useCallback((characterName: string, isSpeaking: boolean): string => {
    if (characterName) {
      // 新的角色命名格式：characterName-speaking 或 characterName-idle
      return `/animation/${characterName}-${isSpeaking ? 'speaking' : 'idle'}`;
    }
    // fallback 到原始路径
    return isSpeaking ? '/animation/1-talk' : '/animation/9-waiting';
  }, []);

  // 获取所有需要预加载的动画路径
  const getAllAnimationPaths = useCallback((characterName: string): string[] => {
    if (characterName) {
      return [
        `/animation/${characterName}-speaking`,
        `/animation/${characterName}-idle`
      ];
    }
    // fallback 到原始路径
    return ['/animation/1-talk', '/animation/9-waiting'];
  }, []);

  // 加载单个动画的帧
  const loadAnimationFrames = useCallback(async (path: string): Promise<HTMLImageElement[]> => {
    const expectedFrames = getExpectedFrameCount(path);
    const frameNumbers = Array.from({ length: expectedFrames }, (_, i) => i + 1);
    
    const imagePromises = frameNumbers.map((num) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load frame ${num}`));
        img.src = `${path}/${num.toString().padStart(4, '0')}.webp`;
      });
    });
    
    return Promise.all(imagePromises);
  }, []);

  // 预加载所有动画
  useEffect(() => {
    const preloadAllAnimations = async () => {
      try {
        setIsLoading(true);
        const allAnimationPaths = getAllAnimationPaths(characterName);
        const cache: AnimationCache = {};

        // 并行加载所有动画
        const loadPromises = allAnimationPaths.map(async (path) => {
          try {
            const frames = await loadAnimationFrames(path);
            cache[path] = frames;
          } catch (error) {
            console.warn(`Failed to load animation at ${path}:`, error);
            // 如果加载失败，尝试加载 fallback 动画
            if (path.includes('speaking') && !path.includes('1-talk')) {
              try {
                const fallbackFrames = await loadAnimationFrames('/animation/1-talk');
                cache[path] = fallbackFrames;
              } catch (fallbackError) {
                console.warn('Fallback animation also failed:', fallbackError);
              }
            } else if (path.includes('idle') && !path.includes('9-waiting')) {
              try {
                const fallbackFrames = await loadAnimationFrames('/animation/9-waiting');
                cache[path] = fallbackFrames;
              } catch (fallbackError) {
                console.warn('Fallback animation also failed:', fallbackError);
              }
            }
          }
        });

        await Promise.all(loadPromises);
        setAnimationCache(cache);

        // 设置初始动画路径
        const initialPath = getAnimationPath(characterName, isSpeaking);
        setCurrentAnimationPath(initialPath);
        
        // 设置初始帧
        if (cache[initialPath]) {
          setFrames(cache[initialPath]);
        } else if (cache[animationPath]) {
          setFrames(cache[animationPath]);
        }
        
        setIsLoading(false);
        console.log('All animations preloaded successfully');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        onError?.(new Error(errorMsg));
        setIsLoading(false);
      }
    };

    preloadAllAnimations();
  }, [loadAnimationFrames, onError, characterName, getAllAnimationPaths, getAnimationPath, isSpeaking, animationPath]);

  // 当说话状态改变时切换动画
  useEffect(() => {
    if (Object.keys(animationCache).length > 0) {
      const newPath = getAnimationPath(characterName, isSpeaking);
      if (newPath !== currentAnimationPath) {
        setCurrentAnimationPath(newPath);
        if (animationCache[newPath]) {
          setFrames(animationCache[newPath]);
          setCurrentFrame(0); // 重置帧计数
          console.log(`Switched to animation: ${newPath}`);
        }
      }
    }
  }, [isSpeaking, characterName, animationCache, currentAnimationPath, getAnimationPath]);

  // 当动画路径改变时从缓存更新帧
  useEffect(() => {
    if (animationCache[animationPath]) {
      setFrames(animationCache[animationPath]);
      setCurrentFrame(0); // 重置帧计数
    }
  }, [animationPath, animationCache]);

  // 绘制当前帧
  const drawFrame = useCallback((frameIndex: number) => {
    if (!canvasRef.current || frames.length === 0 || frameIndex >= frames.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 保存当前状态
    ctx.save();

    // 清除整个画布为透明
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const image = frames[frameIndex];
    if (!image) {
      ctx.restore();
      return;
    }

    // 计算缩放比例保持宽高比，适应容器
    const scaleX = canvas.width / image.width;
    const scaleY = canvas.height / image.height;
    const scale = Math.min(scaleX, scaleY);

    // 计算居中位置
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    // 绘制图像
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

    // 恢复状态
    ctx.restore();
  }, [frames]);

  // 处理画布大小调整
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current;
        const canvas = canvasRef.current;

        // 设置canvas实际尺寸
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // 重新绘制当前帧
        drawFrame(currentFrame);
      }
    };

    // 初始化尺寸
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentFrame, drawFrame]);

  // 动画循环
  useEffect(() => {
    if (frames.length === 0 || isLoading) return;

    let lastFrameTime = 0;
    const frameDuration = 1000 / frameRate;

    const animate = (timestamp: number) => {
      if (!lastFrameTime) lastFrameTime = timestamp;

      const elapsed = timestamp - lastFrameTime;

      if (elapsed > frameDuration) {
        setCurrentFrame(prev => {
          const nextFrame = (prev + 1) % frames.length;
          if (nextFrame === 0 && !loop) {
            return frames.length - 1;
          }
          return nextFrame;
        });
        lastFrameTime = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frames, frameRate, loop, isLoading]);

  // 绘制当前帧
  useEffect(() => {
    drawFrame(currentFrame);
  }, [currentFrame, drawFrame]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`} style={style}>
        <span className="text-red-500">Animation Error: {error}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`} style={style}>
        <span className="text-gray-500">Loading animation...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'transparent',
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};

export default AnimationPlayer;