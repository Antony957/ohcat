import { CatConfig } from '@/types/cat';
import profile from '../../public/catProfile.json';


export const catConfigs: CatConfig[] = [
  {
    id: 'kongkong',
    name: '空空',
    description: '来自Ohcat星球的哲学猫咪，冷静犀利却温暖治愈',
    avatar: '/images/cats/kongkong.png',
    personality: {
      name: '哲学型',
      traits: ['calm', 'analytical', 'humorous', 'empathetic'],
      voiceStyle: 'philosophical',
      preferredActions: ['idle', 'think', 'analyze', 'comfort'],
      emotionalRange: { min: 2, max: 9 }
    },
    availableActions: [
      {
        id: 'idle',
        name: '待机',
        description: '静静地待机状态',
        videoPath: '/videos/kongkong/idle.mp4',
        duration: 8000,
        emotionLevel: 0
      },
      {
        id: 'think',
        name: '思考',
        description: '深度思考和分析',
        videoPath: '/videos/kongkong/think.mp4',
        audioPath: '/audio/kongkong/think.mp3',
        duration: 4000,
        emotionLevel: 1
      },
      {
        id: 'analyze',
        name: '分析',
        description: '理性分析问题',
        videoPath: '/videos/kongkong/analyze.mp4',
        audioPath: '/audio/kongkong/analyze.mp3',
        duration: 5000,
        emotionLevel: 0
      },
      {
        id: 'comfort',
        name: '安慰',
        description: '温暖地安慰',
        videoPath: '/videos/kongkong/comfort.mp4',
        audioPath: '/audio/kongkong/comfort.mp3',
        duration: 6000,
        emotionLevel: 2
      },
      {
        id: 'joke',
        name: '冷幽默',
        description: '说个冷笑话',
        videoPath: '/videos/kongkong/joke.mp4',
        audioPath: '/audio/kongkong/joke.mp3',
        duration: 3000,
        emotionLevel: 1
      }
    ],
    defaultAction: 'idle',
    catAIConfig: {
      TTSConfig: {
        Provider: "volcano",
        ProviderParams: {
          app: {
            AppId: '4348403671',
            Cluster: 'volcano_icl',
            Token: 'B1_MvfGGiF1K3qecY-_28DFW4kbkegtX'
          },
          audio: {
            voice_type: 'S_z3C6AUZq1',
            speed_ratio: 1.0
          }
        }
      }
    }
  },
  {
    id: 'roasty',
    name: 'Roasty（罗西）',
    description: '来自毒舌剧场的脱口秀明星，犀利吐槽但暖心治愈',
    avatar: '/images/cats/roasty.png',
    personality: {
      name: '毒舌型',
      traits: ['sarcastic', 'witty', 'healing', 'sharp'],
      voiceStyle: 'roasting',
      preferredActions: ['idle', 'roast', 'mock', 'angry', 'comfort'],
      emotionalRange: { min: 3, max: 8 }
    },
    availableActions: [
      {
        id: 'idle',
        name: '待机',
        description: '准备开启毒舌模式',
        videoPath: '/videos/roasty/idle.mp4',
        duration: 8000,
        emotionLevel: 0
      },
      {
        id: 'roast',
        name: '吐槽',
        description: '犀利吐槽一波',
        videoPath: '/videos/roasty/roast.mp4',
        audioPath: '/audio/roasty/roast.mp3',
        duration: 4000,
        emotionLevel: 2
      },
      {
        id: 'mock',
        name: '嘲讽',
        description: '幽默嘲讽表演',
        videoPath: '/videos/roasty/mock.mp4',
        audioPath: '/audio/roasty/mock.mp3',
        duration: 3000,
        emotionLevel: 1
      },
      {
        id: 'analyze',
        name: '毒舌诊断',
        description: '深度剖析用户问题',
        videoPath: '/videos/roasty/analyze.mp4',
        audioPath: '/audio/roasty/analyze.mp3',
        duration: 5000,
        emotionLevel: 0
      },
      {
        id: 'comfort',
        name: '暖心治愈',
        description: '毒舌后的温暖安慰',
        videoPath: '/videos/roasty/comfort.mp4',
        audioPath: '/audio/roasty/comfort.mp3',
        duration: 6000,
        emotionLevel: 3
      },
      {
        id: 'perform',
        name: '脱口秀',
        description: '即兴脱口秀表演',
        videoPath: '/videos/roasty/perform.mp4',
        audioPath: '/audio/roasty/perform.mp3',
        duration: 7000,
        emotionLevel: 2
      },
      {
        id: 'angry',
        name: '愤怒',
        description: '暴怒状态的激烈表现',
        videoPath: '/videos/roasty/angry.mp4',
        audioPath: '/audio/roasty/angry.mp3',
        duration: 5000,
        emotionLevel: 4
      }
    ],
    defaultAction: 'idle',
    catAIConfig: {
      TTSConfig: {
        Provider: "volcano",
        ProviderParams: {
          app: {
            AppId: '4348403671',
            Cluster: 'volcano_icl',
            Token: 'B1_MvfGGiF1K3qecY-_28DFW4kbkegtX'
          },
          audio: {
            voice_type: 'S_z3C6AUZq1',
            speed_ratio: 1.0
          }
        }
      }
    }
  },
  {
    id: 'pine',
    name: "墨松",
    description: '来自Ohcat星球「心语松林」，一片吸收宇宙低语的漂浮森林。',
    catAIConfig: {
      TTSConfig: {
        Provider: "volcano",
        ProviderParams: {
          app: {
            AppId: '4348403671',
            Cluster: 'volcano_icl',
            Token: 'B1_MvfGGiF1K3qecY-_28DFW4kbkegtX'
          },
          audio: {
            voice_type: 'S_z3C6AUZq1',
            speed_ratio: 1.0
          }
        }
      }
    }
  },
  {
    id: 'ogle',
    name: "奥格尔",
    description: '来自Ohcat星球「星河神殿」，一个悬浮在银河中的占星圣地。',
    catAIConfig: {
      TTSConfig: {
        Provider: "volcano",
        ProviderParams: {
          app: {
            AppId: '4348403671',
            Cluster: 'volcano_icl',
            Token: 'B1_MvfGGiF1K3qecY-_28DFW4kbkegtX'
          },
          audio: {
            voice_type: 'S_z3C6AUZq1',
            speed_ratio: 1.0
          }
        }
      }
    }
  },
  {
    id: 'mianmian',
    name: "绵绵",
    description: '来自Ohcat星球的「云绒巢穴」，一个悬浮在星云中的毛绒睡眠圣地，帮助猫恢复能量。',
    catAIConfig: {
      TTSConfig: {
        Provider: "volcano",
        ProviderParams: {
          app: {
            AppId: '4348403671',
            Cluster: 'volcano_icl',
            Token: 'B1_MvfGGiF1K3qecY-_28DFW4kbkegtX'
          },
          audio: {
            voice_type: 'S_z3C6AUZq1',
            speed_ratio: 1.0
          }
        }
      }
    }
  },
  {
    id: 'oga',
    name: "奥伽",
    description: '来自Ohcat星球「灯海小镇」，一个漂浮于光晕湖泊的治愈之地，位于地球650光年之外。',
    catAIConfig: {
      TTSConfig: {
        Provider: "volcano",
        ProviderParams: {
          app: {
            AppId: '4348403671',
            Cluster: 'volcano_icl',
            Token: 'B1_MvfGGiF1K3qecY-_28DFW4kbkegtX'
          },
          audio: {
            voice_type: 'S_z3C6AUZq1',
            speed_ratio: 1.0
          }
        }
      }
    }
  },
];

export function getCatConfigById(id: string): CatConfig {
  const found = catConfigs.find(config => config.id === id);
  if (found) {
    const match = profile.find(item => item.id === id);
    
    if (match) {
      found.prompt = match.prompt;
      if (!found.catAIConfig.LLMConfig) {
        found.catAIConfig.LLMConfig = {};
      }
      found.catAIConfig.LLMConfig.WelcomeSpeechSet = match.welcome_speech;
      found.catAIConfig.LLMConfig.SystemExamples = match.system_example.map(item =>
          `"user": ${JSON.stringify(item.user)}, "assistant": ${JSON.stringify(item.assistant)}`
      );
    }
    return found;
  }
  // 返回一个默认的 CatConfig 对象，字段根据你的 CatConfig 类型定义填写
  return catConfigs[0];
}

export function getAllCatConfigs(): CatConfig[] {
  return [...catConfigs];
}