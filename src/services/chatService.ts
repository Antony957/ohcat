export interface ChatRequest {
  message: string;
  catId: string;
  prompt: string;
}

export interface ChatResponse {
  reply: string;
  catId: string;
  timestamp: string;
}

export class ChatService {
  private static instance: ChatService;

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  // 根据猫咪情绪调整prompt
  getEmotionModifiedPrompt(basePrompt: string, emotionLevel: number): string {
    let emotionModifier = '';
    
    if (emotionLevel >= 8) {
      emotionModifier = '\n\n当前情绪状态：非常开心兴奋，回复要更加活泼热情。';
    } else if (emotionLevel >= 6) {
      emotionModifier = '\n\n当前情绪状态：心情不错，回复要温暖友好。';
    } else if (emotionLevel >= 4) {
      emotionModifier = '\n\n当前情绪状态：平静中性，保持正常的对话风格。';
    } else if (emotionLevel >= 2) {
      emotionModifier = '\n\n当前情绪状态：有些低落，回复要更加温和安慰。';
    } else {
      emotionModifier = '\n\n当前情绪状态：情绪很低，需要特别的关怀和安慰。';
    }

    return basePrompt + emotionModifier;
  }

  // 处理错误回复
  getErrorReply(catId: string): string {
    const errorReplies = {
      'kongkong': '抱歉，我的系统出现了一些问题...让我重新整理一下思路。',
      'roasty': '哎呀，我的毒舌程序卡住了...给我点时间重启一下。',
      default: '喵~ 我现在有点困惑，能再说一遍吗？'
    };

    return errorReplies[catId as keyof typeof errorReplies] || errorReplies.default;
  }
}