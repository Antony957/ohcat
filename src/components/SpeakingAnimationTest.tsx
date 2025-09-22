/**
 * 说话动画测试组件
 * 用于测试说话动画功能是否正常工作
 */

import React, { useState, useEffect } from 'react';
import { registerSpeakingStateCallback } from '@/lib/AudioStreamManager';
import RTCClient from '@/lib/RtcClient';

const SpeakingAnimationTest: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // 监听说话状态变化
  useEffect(() => {
    const unregister = registerSpeakingStateCallback((speaking: boolean) => {
      console.log(`Test: Speaking state changed to ${speaking}`);
      setIsSpeaking(speaking);
      setTestResults(prev => [...prev, `说话状态变更: ${speaking ? '开始说话' : '停止说话'} - ${new Date().toLocaleTimeString()}`]);
    });

    return unregister;
  }, []);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${message} - ${new Date().toLocaleTimeString()}`]);
  };

  // 测试手动触发说话状态
  const testManualTrigger = () => {
    addTestResult('测试: 手动触发说话状态');
    RTCClient.triggerSpeakingState(true);
    
    // 3秒后停止
    setTimeout(() => {
      addTestResult('测试: 手动停止说话状态');
      RTCClient.triggerSpeakingState(false);
    }, 3000);
  };

  // 测试音频流添加
  const testAudioStream = () => {
    addTestResult('测试: 添加AI音频流');
    const audioData = new ArrayBuffer(1024);
    RTCClient.addAudioStream(audioData, true);
  };

  // 测试多个连续音频流
  const testMultipleStreams = () => {
    addTestResult('测试: 添加多个连续音频流');
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const audioData = new ArrayBuffer(1024);
        RTCClient.addAudioStream(audioData, true);
        addTestResult(`添加第${i + 1}个音频流`);
      }, i * 1000);
    }
  };

  // 清空测试结果
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-lg font-semibold mb-3">说话动画测试工具</h3>
      
      {/* 当前状态 */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <div className="flex items-center gap-2">
          <span className="font-medium">当前状态:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            isSpeaking ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
          }`}>
            {isSpeaking ? '说话中' : '待机'}
          </span>
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="space-y-2 mb-4">
        <button
          onClick={testManualTrigger}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          手动触发测试
        </button>
        <button
          onClick={testAudioStream}
          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          音频流测试
        </button>
        <button
          onClick={testMultipleStreams}
          className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
        >
          多音频流测试
        </button>
        <button
          onClick={clearResults}
          className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
        >
          清空结果
        </button>
      </div>

      {/* 测试结果 */}
      <div className="max-h-40 overflow-y-auto">
        <h4 className="font-medium mb-2">测试结果:</h4>
        <div className="space-y-1">
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无测试结果</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakingAnimationTest;