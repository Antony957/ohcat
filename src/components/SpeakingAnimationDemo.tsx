/**
 * 说话动画演示组件
 * 展示如何使用新的说话动画功能
 */

import React, { useState } from 'react';
import AnimationPlayer from './AnimationPlayer';
import { useSpeakingAnimation } from '@/hooks/useSpeakingAnimation';
import RTCClient from '@/lib/RtcClient';

const SpeakingAnimationDemo: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState('mianmian');
  const [manualSpeaking, setManualSpeaking] = useState(false);
  
  // 使用说话动画 Hook
  const { isSpeaking, animationPath, setSpeakingState } = useSpeakingAnimation({
    characterName: selectedCharacter,
    defaultIsSpeaking: false
  });

  // 可用的角色列表
  const availableCharacters = [
    { name: 'mianmian', label: '绵绵' },
    { name: 'aoger', label: '傲格' },
    { name: 'aojia', label: '傲嘉' },
    { name: 'mosong', label: '墨松' },
    { name: 'roasty', label: '咖啡' }
  ];

  // 模拟音频播放
  const simulateAudioPlayback = async () => {
    // 模拟 AI 回复音频
    const audioBlob = new Blob(['fake audio data'], { type: 'audio/wav' });
    RTCClient.addAudioStream(audioBlob, true); // 标记为 AI 回复
  };

  // 模拟多个连续的 AI 回复
  const simulateMultipleResponses = async () => {
    const responses = ['response1', 'response2', 'response3'];
    
    for (let i = 0; i < responses.length; i++) {
      setTimeout(() => {
        const audioBlob = new Blob([`fake audio data ${i + 1}`], { type: 'audio/wav' });
        RTCClient.addAudioStream(audioBlob, true);
      }, i * 1000);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">说话动画演示</h1>
      
      {/* 角色选择 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">选择角色</h3>
        <div className="flex flex-wrap gap-2">
          {availableCharacters.map((character) => (
            <button
              key={character.name}
              onClick={() => setSelectedCharacter(character.name)}
              className={`px-4 py-2 rounded border ${
                selectedCharacter === character.name
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {character.label}
            </button>
          ))}
        </div>
      </div>

      {/* 动画播放器 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">动画播放器</h3>
        <div className="w-80 h-80 mx-auto border border-gray-300 rounded-lg overflow-hidden">
          <AnimationPlayer
            animationPath={animationPath}
            characterName={selectedCharacter}
            isSpeaking={isSpeaking}
            className="w-full h-full"
            frameRate={24}
            loop={true}
          />
        </div>
      </div>

      {/* 状态显示 */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">当前状态</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">角色:</span> {selectedCharacter}
          </div>
          <div>
            <span className="font-medium">说话状态:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              isSpeaking ? 'bg-green-200 text-green-800' : 'bg-gray-200'
            }`}>
              {isSpeaking ? '说话中' : '待机'}
            </span>
          </div>
          <div>
            <span className="font-medium">动画路径:</span> {animationPath}
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">控制选项</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={simulateAudioPlayback}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              模拟单个 AI 回复
            </button>
            <button
              onClick={simulateMultipleResponses}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              模拟多个连续回复
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSpeakingState(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              手动设置说话状态
            </button>
            <button
              onClick={() => setSpeakingState(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              手动设置待机状态
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => RTCClient.stopAllAudioStreams()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              停止所有音频
            </button>
            <button
              onClick={() => RTCClient.pauseAllAudioStreams()}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              暂停音频
            </button>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">功能说明</h3>
        <ul className="text-sm space-y-1">
          <li>• 角色会根据音频播放状态自动切换动画</li>
          <li>• 播放 AI 回复音频时，角色会切换到说话动画</li>
          <li>• 音频播放完成后，角色会自动回到待机动画</li>
          <li>• 支持队列播放，确保音频不会重叠</li>
          <li>• 可以手动控制说话状态进行测试</li>
        </ul>
      </div>

      {/* 代码示例 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">代码示例</h3>
        <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`// 使用说话动画 Hook
const { isSpeaking, animationPath } = useSpeakingAnimation({
  characterName: 'mianmian',
  defaultIsSpeaking: false
});

// 在组件中使用
<AnimationPlayer
  animationPath={animationPath}
  characterName="mianmian"
  isSpeaking={isSpeaking}
  className="w-full h-full"
  frameRate={24}
  loop={true}
/>

// 添加 AI 回复音频（会自动触发说话动画）
RTCClient.addAudioStream(audioBlob, true);`}
        </pre>
      </div>
    </div>
  );
};

export default SpeakingAnimationDemo;