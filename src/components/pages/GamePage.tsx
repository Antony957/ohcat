import { useState } from 'react';

const GamePage = () => {
  const [searchValue, setSearchValue] = useState('');

  // 示例市集商品数据
  const marketItems = [
    { id: 1, image: '/images/goods/image.png', name: '暗夜精灵', price: 500, height: 'h-52' },
    { id: 2, image: '/images/goods/lingwa.png', name: '灵蛙', price: 600, height: 'h-52' },
    { id: 3, image: '/images/goods/maobao.png', name: '猫包', price: 10000, height: 'h-56' },
    { id: 4, image: '/images/goods/kongkonghuaban.png', name: '空空画板', price: 20000, height: 'h-56' },
    { id: 5, image: '/images/goods/feipan.png', name: '飞盘', price: 1000 , height: 'h-52' },
    { id: 6, image: '/images/goods/beizi.png', name: '喵星杯子', price: 3000, height: 'h-52' },
  ];

  return (
    <div className="relative h-full">
      {/* SVG滤镜定义 */}
      <svg style={{display: 'none'}}>
        <filter
          id="glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.01"
            numOctaves="1"
            seed="5"
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="150"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* 内容容器 */}
      <div className="h-full">
        <div className="max-w-6xl mx-auto">
          {/* 头部区域 */}
          <div className="flex items-center justify-between">
            {/* 左侧标题 */}
            <h1 className="text-white text-xl font-medium">市集</h1>
            
            {/* 右侧搜索框 */}
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="搜索商品..."
                className="w-64 pl-4 pr-12 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/70 hover:text-black transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Spacer Element */}
          <div className="h-4"></div>

          {/* 商品卡片网格 - 两列瀑布流布局 */}
          <div className="grid grid-cols-2 gap-8">
            {marketItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-4">
                <div
                  className={`liquidGlass-wrapper card ${item.height} cursor-pointer hover:scale-105 transition-transform duration-300 overflow-hidden flex items-center justify-center p-4`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={`Goods ${item.id}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-white font-semibold text-sm">{item.name}</span>
                  <span className="text-white font-bold text-sm">{item.price}喵喵币</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;