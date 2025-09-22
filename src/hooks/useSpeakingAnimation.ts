/**
 * 说话动画状态管理 Hook
 * 自动根据音频播放状态切换动画
 */

import { useState, useEffect, useCallback } from 'react';
import { registerSpeakingStateCallback } from '@/lib/AudioStreamManager';

interface UseSpeakingAnimationOptions {
  characterName?: string;
  defaultIsSpeaking?: boolean;
}

export const useSpeakingAnimation = (options: UseSpeakingAnimationOptions = {}) => {
  const { characterName = '', defaultIsSpeaking = false } = options;
  
  const [isSpeaking, setIsSpeaking] = useState(defaultIsSpeaking);
  const [animationPath, setAnimationPath] = useState<string>('');

  // 根据角色名称和说话状态获取动画路径
  const getAnimationPath = useCallback((characterName: string, isSpeaking: boolean): string => {
    if (characterName) {
      // 新的角色命名格式：characterName-speaking 或 characterName-idle
      return `/animation/${characterName}-${isSpeaking ? 'speaking' : 'idle'}`;
    }
    // fallback 到原始路径
    return isSpeaking ? '/animation/1-talk' : '/animation/9-waiting';
  }, []);

  // 注册说话状态变化回调
  useEffect(() => {
    const unregister = registerSpeakingStateCallback((speaking: boolean) => {
      setIsSpeaking(speaking);
      console.log(`Speaking state changed: ${speaking}`);
    });

    return unregister;
  }, []);

  // 当角色名称或说话状态改变时更新动画路径
  useEffect(() => {
    const newPath = getAnimationPath(characterName, isSpeaking);
    setAnimationPath(newPath);
  }, [characterName, isSpeaking, getAnimationPath]);

  // 手动设置说话状态
  const setSpeakingState = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
  }, []);

  return {
    isSpeaking,
    animationPath,
    setSpeakingState
  };
};

export default useSpeakingAnimation;