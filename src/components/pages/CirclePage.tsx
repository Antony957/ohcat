const CirclePage = () => {
  // 圈子数据
  const circleItems = [
    { id: 1, name: '今日运势', avatar: '/images/circle/yunshi.png' },
    { id: 2, name: '我妈总说不累', avatar: '/images/circle/bulei.png' },
    { id: 3, name: '毒舌剧场', avatar: '/images/circle/laoge.png' },
    { id: 4, name: '占星预言家', avatar: '/images/circle/nengliang.png' }, 
    { id: 5, name: '云端梦境', avatar: '/images/circle/miaoxing.png' },
    { id: 6, name: '姨姨们，我在喵星很好', avatar: '/images/circle/qingbao.png' },
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
          {/* 标题 */}
          <div className="mb-16">
            <h1 className="text-white text-xl font-medium">猫猫圈</h1>
          </div>
          
          {/* 间距容器 */}
          <div className="h-6"></div>
          
          {/* 圈子卡片网格容器 */}
          <div className="columns-2 lg:columns-3 gap-8" style={{columnGap: '2rem'}}>
            {circleItems.map((circle) => (
              <div key={circle.id}>
                <div className="liquidGlass-wrapper card min-h-32 cursor-pointer inline-block w-full break-inside-avoid">
                  <div className="liquidGlass-effect"></div>
                  <div className="liquidGlass-tint"></div>
                  <div className="liquidGlass-shine"></div>
                  <div className="liquidGlass-text w-full relative flex flex-col p-4">
                    {/* 头像 */}
                    <div className="w-full flex justify-center mb-4">
                      <img 
                        src={circle.avatar} 
                        alt={circle.name}
                        className="max-w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<span class="text-lg">🐱</span>';
                        }}
                      />
                    </div>
                    
                    {/* 文字内容区域 */}
                    <div>
                      {/* 圈子名称 */}
                      <h3 className="text-black text-lg font-semibold text-center">{circle.name}</h3>
                    </div>
                  </div>
                </div>
                {/* 间距div */}
                <div className="h-6 w-full break-inside-avoid"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CirclePage;