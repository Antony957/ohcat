'use client'; // 如果是 Next.js app dir 下的 client component

import { useState } from 'react';
import { Provider } from 'react-redux';
import store from "@/store";
import HomePage from '../pages/HomePage';
import GamePage from '../pages/GamePage';
import ChatPage from '../pages/ChatPage';
import CirclePage from '../pages/CirclePage';
import SettingsPage from '../pages/SettingsPage';
import VideoChatPage from '../pages/VideoChatPage';
import { CatConfig } from '@/types/cat';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCat, setSelectedCat] = useState<CatConfig | null>(null);
  const [inVideoCall, setInVideoCall] = useState(false);

  const bottomTabs = [
    { 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 1024 1024" fill="currentColor">
          <path d="M908.266667 515.786667a5.333333 5.333333 0 0 0 0-7.52l-348.8-348.8-49.066667-49.066667a5.333333 5.333333 0 0 0-7.466667 0L105.066667 508.266667a5.333333 5.333333 0 0 0 0 7.52l45.28 45.28a5.333333 5.333333 0 0 0 7.52 0l1.76-1.813334a5.333333 5.333333 0 0 1 9.066666 3.786667V912a5.333333 5.333333 0 0 0 5.333334 5.333333h665.28a5.333333 5.333333 0 0 0 5.333333-5.333333v-349.013333a5.333333 5.333333 0 0 1 9.066667-3.733334l1.76 1.813334a5.333333 5.333333 0 0 0 7.52 0zM764.64 842.666667H248.693333a5.333333 5.333333 0 0 1-5.333333-5.333334V477.706667a5.333333 5.333333 0 0 1 1.6-3.733334L502.933333 216a5.333333 5.333333 0 0 1 7.466667 0l257.973333 257.973333a5.333333 5.333333 0 0 1 1.6 3.733334V837.333333a5.333333 5.333333 0 0 1-5.333333 5.333334z" />
          <path d="M405.333333 863.36h202.666667v-222.933333a5.6 5.6 0 0 0-5.333333-5.866667H410.666667a5.6 5.6 0 0 0-5.333334 5.866667z" />
        </svg>
      ) 
    },
    { 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 1024 1024" fill="currentColor">
          <path d="M864 617.6c-19.2 0-32 12.8-32 32v195.2c0 9.6-9.6 19.2-19.2 19.2H211.2c-9.6 0-19.2-9.6-19.2-19.2v-195.2c0-19.2-12.8-32-32-32s-32 12.8-32 32v195.2C128 889.6 166.4 928 211.2 928h601.6c44.8 0 83.2-38.4 83.2-83.2v-195.2c0-19.2-12.8-32-32-32zM956.8 316.8l-105.6-204.8c-6.4-9.6-16-16-28.8-16h-640c-12.8 0-25.6 9.6-28.8 22.4l-83.2 208c-6.4 6.4-3.2 22.4-3.2 25.6v80c0 80 67.2 147.2 147.2 147.2H256c48 0 86.4-16 112-44.8 25.6 28.8 70.4 44.8 124.8 44.8h41.6c54.4 0 99.2-16 124.8-44.8 25.6 25.6 64 41.6 112 41.6h41.6c80 0 147.2-67.2 147.2-147.2v-83.2c0-3.2 0-22.4-3.2-28.8zM204.8 160h598.4l67.2 128H150.4l54.4-128z m608 352h-41.6c-19.2 0-83.2-3.2-83.2-64 0-19.2-12.8-32-32-32s-32 12.8-32 32v12.8c0 51.2-76.8 54.4-92.8 54.4h-41.6c-16 0-92.8-3.2-92.8-54.4v-6.4-3.2c0-19.2-12.8-32-32-32s-32 12.8-32 32c0 48-41.6 64-83.2 64H211.2c-44.8 0-83.2-38.4-83.2-83.2V352h768v76.8c0 44.8-35.2 83.2-83.2 83.2z" />
        </svg>
      ) 
    }, 
    { 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 1024 1024" fill="currentColor">
          <path d="M661.333333 490.666667h-128v-128a21.333333 21.333333 0 0 0-42.666666 0v128h-128a21.333333 21.333333 0 0 0 0 42.666666h128v128a21.333333 21.333333 0 0 0 42.666666 0v-128h128a21.333333 21.333333 0 0 0 0-42.666666z" />
          <path d="M512 85.333333a426.666667 426.666667 0 1 0 426.666667 426.666667A427.157333 427.157333 0 0 0 512 85.333333z m0 810.666667a384 384 0 1 1 384-384 384.426667 384.426667 0 0 1-384 384z" />
        </svg>
      ) 
    },
    { 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 1026 1024" fill="currentColor">
          <path d="M441.571072 263.68m-84.48 0a3.3 3.3 0 1 0 168.96 0 3.3 3.3 0 1 0-168.96 0Z" />
          <path d="M280.291072 537.6m-48.64 0a1.9 1.9 0 1 0 97.28 0 1.9 1.9 0 1 0-97.28 0Z" />
          <path d="M664.291072 775.68m-33.28 0a1.3 1.3 0 1 0 66.56 0 1.3 1.3 0 1 0-66.56 0Z" />
          <path d="M940.771072 235.52c5.12-7.68 10.24-15.36 15.36-23.04 20.48-38.4 53.76-97.28 35.84-151.04-10.24-25.6-28.16-38.4-40.96-43.52-46.08-15.36-107.52 23.04-117.76 30.72-12.8 7.68-15.36 23.04-7.68 35.84 7.68 12.8 23.04 15.36 35.84 7.68 20.48-12.8 56.32-30.72 74.24-23.04 2.56 0 5.12 2.56 7.68 10.24 10.24 30.72-15.36 76.8-33.28 110.08-43.52 79.36-102.4 151.04-161.28 225.28-138.24 168.96-296.96 312.32-486.4 435.2-7.68 5.12-15.36 10.24-25.6 15.36-102.4-81.92-168.96-209.92-168.96-353.28 0-250.88 202.24-453.12 453.12-453.12 56.32 0 107.52 10.24 156.16 28.16l0 0c2.56 0 5.12 2.56 7.68 2.56 15.36 0 25.6-10.24 25.6-25.6 0-10.24-7.68-20.48-17.92-23.04-53.76-20.48-112.64-30.72-174.08-30.72C241.891072 7.68 16.611072 232.96 16.611072 512c0 87.04 23.04 168.96 61.44 240.64-10.24 15.36-46.08 64-69.12 120.32-15.36 35.84-10.24 69.12 10.24 92.16 15.36 17.92 40.96 28.16 69.12 28.16 10.24 0 23.04-2.56 33.28-5.12 40.96-12.8 79.36-35.84 112.64-58.88 81.92 56.32 179.2 89.6 286.72 89.6C799.971072 1016.32 1025.251072 791.04 1025.251072 512 1025.251072 409.6 994.531072 314.88 940.771072 235.52zM106.211072 936.96c-17.92 5.12-38.4 2.56-48.64-7.68-10.24-10.24-5.12-25.6-2.56-38.4 15.36-35.84 35.84-71.68 51.2-92.16 25.6 35.84 53.76 66.56 84.48 94.72C165.091072 911.36 136.931072 926.72 106.211072 936.96zM520.931072 965.12c-87.04 0-168.96-25.6-238.08-69.12 2.56-2.56 5.12-2.56 7.68-5.12 192-125.44 355.84-271.36 496.64-445.44 43.52-53.76 84.48-104.96 122.88-161.28 38.4 66.56 64 145.92 64 227.84C974.051072 762.88 771.811072 965.12 520.931072 965.12z" />
        </svg>
      ) 
    },
    { 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 1024 1024" fill="currentColor">
          <path d="M899.2 379.2a439.68 439.68 0 0 0-19.52-47.04 137.28 137.28 0 0 0-187.84-187.84 439.68 439.68 0 0 0-47.04-19.52 137.28 137.28 0 0 0-265.6 0 439.68 439.68 0 0 0-47.04 19.52 137.28 137.28 0 0 0-187.84 187.84 439.68 439.68 0 0 0-19.52 47.04 137.28 137.28 0 0 0 0 265.6 439.68 439.68 0 0 0 19.52 47.04 137.28 137.28 0 0 0 187.84 187.84 439.68 439.68 0 0 0 47.04 19.52 137.28 137.28 0 0 0 265.6 0 439.68 439.68 0 0 0 47.04-19.52 137.28 137.28 0 0 0 187.84-187.84 439.68 439.68 0 0 0 19.52-47.04 137.28 137.28 0 0 0 0-265.6z m-33.6 186.88a41.6 41.6 0 0 0-38.72 32 314.24 314.24 0 0 1-32 77.76 41.92 41.92 0 0 0 5.12 48A54.08 54.08 0 0 1 723.84 800a41.92 41.92 0 0 0-49.28-5.76 314.24 314.24 0 0 1-77.76 32 41.6 41.6 0 0 0-32 38.72 54.08 54.08 0 0 1-108.16 0 41.6 41.6 0 0 0-32-38.72 314.24 314.24 0 0 1-77.76-32 43.84 43.84 0 0 0-20.8-5.44 42.24 42.24 0 0 0-28.48 11.2A54.08 54.08 0 0 1 224 723.84a41.92 41.92 0 0 0 5.76-49.28 314.24 314.24 0 0 1-32-77.76 41.6 41.6 0 0 0-38.72-32 54.08 54.08 0 0 1 0-108.16 41.6 41.6 0 0 0 38.72-32 314.24 314.24 0 0 1 32-77.76A41.92 41.92 0 0 0 224 300.16 54.08 54.08 0 0 1 300.16 224a41.92 41.92 0 0 0 49.28 5.76 314.24 314.24 0 0 1 77.76-32 41.6 41.6 0 0 0 32-38.72 54.08 54.08 0 0 1 108.16 0 41.6 41.6 0 0 0 32 38.72 314.24 314.24 0 0 1 77.76 32A41.92 41.92 0 0 0 723.84 224 54.08 54.08 0 0 1 800 300.16a41.92 41.92 0 0 0-5.76 49.28 314.24 314.24 0 0 1 32 77.76 41.6 41.6 0 0 0 38.72 32 54.08 54.08 0 0 1 0 108.16z" />
          <path d="M512 310.4a201.6 201.6 0 1 0 201.6 201.6A201.92 201.92 0 0 0 512 310.4z m0 320a118.4 118.4 0 1 1 118.4-118.4 118.4 118.4 0 0 1-118.4 118.4z" />
        </svg>
      ) 
    }
  ];

  return (
    <Provider store={store}>
      <div className="app-container">
        {/* 主要内容区域 */}
        <div className="main-content">
          {inVideoCall ? (
            <VideoChatPage selectedCat={selectedCat} onBack={() => setInVideoCall(false)} />
          ) : (
            <>
              {activeTab === 0 && <HomePage onCatSelect={(cat: CatConfig) => { setSelectedCat(cat); setActiveTab(2); }} />}
              {activeTab === 1 && <GamePage />}
              {activeTab === 2 && <ChatPage key={selectedCat?.id} selectedCat={selectedCat} onBack={() => { setActiveTab(0); setSelectedCat(null); }} onVideoCall={() => setInVideoCall(true)} />}
              {activeTab === 3 && <CirclePage />}
              {activeTab === 4 && <SettingsPage />}
            </>
          )}
        </div>

        {/* 底部导航栏 (视频通话时不显示) */}
        {!inVideoCall && (
          <div className="bottom-navigation">
            {bottomTabs.map((tab, index) => (
              <button
                key={index}
                className={`nav-button ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                <span className="nav-icon">{typeof tab.icon === 'string' ? tab.icon : tab.icon}</span>
              </button>
            ))}
          </div>
        )}

        {/* 全局样式 */}
        <style jsx>{`
          .app-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: url('/images/bg/background.png'); background-size: cover; background-position: center;
            background-attachment: fixed;
            overflow: hidden;
          }

          .main-content {
            flex: 1;
            position: relative;
            overflow-y: auto;
            padding: 20px 16px 90px 16px;
          }


          .bottom-navigation {
            display: flex;
            height: 70px;
            background: transparent;
            padding: 8px 16px;
            gap: 8px;
            z-index: 100;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
          }

          .nav-button {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 12px 8px;
            border-radius: 12px;
            margin: 0 2px;
          }

          .nav-button:hover {
            color: rgba(255, 255, 255, 0.9);
            transform: scale(1.1);
          }

          .nav-button.active {
            color: #ff69b4;
            transform: scale(1.15);
          }

          .nav-button.active .nav-icon {
            filter: drop-shadow(0 0 12px #ff69b4) drop-shadow(0 0 20px rgba(255, 105, 180, 0.5));
          }

          .nav-icon {
            font-size: 28px;
            transition: all 0.3s ease;
          }

          @keyframes gentle-drift {
            0%, 100% { 
              transform: translateX(0) translateY(0) rotate(0deg);
              opacity: 0.8;
            }
            25% { 
              transform: translateX(20px) translateY(-10px) rotate(1deg);
              opacity: 0.6;
            }
            50% { 
              transform: translateX(-10px) translateY(20px) rotate(-0.5deg);
              opacity: 0.9;
            }
            75% { 
              transform: translateX(15px) translateY(5px) rotate(0.5deg);
              opacity: 0.7;
            }
          }

          /* 响应式优化 */
          @media (max-width: 768px) {
            .main-content {
              padding: 16px 12px 80px 12px;
            }
            .bottom-navigation {
              height: 60px;
              padding: 6px 12px;
            }
            .nav-button {
              padding: 10px 6px;
              margin: 0 1px;
            }
            .nav-icon {
              font-size: 24px;
            }
          }

          @media (max-width: 480px) {
            .main-content {
              padding: 12px 8px 75px 8px;
            }
            .bottom-navigation {
              height: 55px;
              padding: 4px 8px;
            }
            .nav-button {
              padding: 8px 4px;
              margin: 0 1px;
            }
            .nav-icon {
              font-size: 22px;
            }
          }
        `}</style>
      </div>
    </Provider>
  );
};

export default MainLayout;
