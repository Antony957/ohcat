export interface CatAction {
  id: string;
  name: string;
  description: string;
  videoPath: string;
  audioPath?: string;
  duration: number;
  emotionLevel: number;
}

export interface CatPersonality {
  name: string;
  traits: string[];
  voiceStyle: string;
  preferredActions: string[];
  emotionalRange: {
    min: number;
    max: number;
  };
}

export interface CatState {
  id: string;
  name: string;
  personality: CatPersonality;
  currentEmotion: number;
  currentAction: string;
  isPlaying: boolean;
  lastInteraction: Date;
  conversationHistory: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  audioPath?: string;
}

export interface CatAIConfig {
  LLMConfig?: {
    SystemExamples?: string[];
    WelcomeSpeechSet?: string[];
  };
  TTSConfig?: {
    Provider?: string;
    ProviderParams?: {
      Authorization?: string;
      Groupid?: string;
      model?: string;
      URL?: string;
      stream?: boolean;
      voice_setting?: {
        voice_id?: string;
        speed?: number;
        vol?: number;
        pitch?: number;
      };
      app?: {
        AppId?: string;
        Cluster?: string;
        Token?: string;
      };
      audio?: {
        voice_type?: string;
        speed_ratio?: number;
      };
    };
  };
}


export interface CatConfig {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  prompt?: string;
  personality?: CatPersonality;
  availableActions?: CatAction[];
  defaultAction?: string;
  catAIConfig: CatAIConfig;
}