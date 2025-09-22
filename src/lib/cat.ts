import {CatConfig, CatState, CatAction, ChatMessage, CatAIConfig} from '@/types/cat';

export class VirtualCat {
  private state: CatState;
  private config: CatConfig;

  constructor(config: CatConfig) {
    this.config = config;
    this.state = {
      id: config.id,
      name: config.name,
      personality: config.personality,
      currentEmotion: 5,
      currentAction: config.defaultAction,
      isPlaying: false,
      lastInteraction: new Date(),
      conversationHistory: [],
    };
  }

  public getState(): CatState {
    return { ...this.state };
  }

  public getName(): string {
    return this.state.name;
  }

  public getCurrentAction(): string {
    return this.state.currentAction;
  }

  public isCurrentlyPlaying(): boolean {
    return this.state.isPlaying;
  }

  public setPlaying(playing: boolean): void {
    this.state.isPlaying = playing;
  }

  public performAction(actionId: string): CatAction | null {
    const action = this.config.availableActions.find(a => a.id === actionId);
    if (!action) return null;

    this.state.currentAction = actionId;
    this.state.currentEmotion = Math.max(0, Math.min(10, 
      this.state.currentEmotion + action.emotionLevel
    ));
    this.state.lastInteraction = new Date();

    return action;
  }

  public getRandomAction(): CatAction {
    const actions = this.config.availableActions;
    const randomIndex = Math.floor(Math.random() * actions.length);
    return actions[randomIndex];
  }

  public getPreferredAction(): CatAction {
    const preferredActionIds = this.state.personality.preferredActions;
    const availablePreferred = this.config.availableActions.filter(
      action => preferredActionIds.includes(action.id)
    );
    
    if (availablePreferred.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePreferred.length);
      return availablePreferred[randomIndex];
    }
    
    return this.getRandomAction();
  }

  public addMessage(message: ChatMessage): void {
    this.state.conversationHistory.push(message);
    this.state.lastInteraction = new Date();
    
    // Keep only last 50 messages to manage memory
    if (this.state.conversationHistory.length > 50) {
      this.state.conversationHistory = this.state.conversationHistory.slice(-50);
    }
  }

  public getConversationHistory(): ChatMessage[] {
    return [...this.state.conversationHistory];
  }

  public generateResponse(_userMessage: string): string {
    // Simple response generation based on personality traits
    const traits = this.state.personality.traits;
    const responses = {
      friendly: [
        "喵~ 我很高兴和你聊天！",
        "你真是太好了，我喜欢你！",
        "喵喵，今天过得怎么样？"
      ],
      playful: [
        "我们一起玩游戏吧！喵~",
        "哈哈，你真有趣！",
        "喵呜~ 我想和你一起玩！"
      ],
      calm: [
        "嗯，这很有趣...",
        "我在静静地听着你说话。",
        "慢慢来，我有时间。"
      ],
      energetic: [
        "哇！太棒了！",
        "我充满了活力！喵喵喵！",
        "让我们做点什么有趣的事情！"
      ]
    };

    // Select response based on personality traits
    for (const trait of traits) {
      if (responses[trait as keyof typeof responses]) {
        const traitResponses = responses[trait as keyof typeof responses];
        return traitResponses[Math.floor(Math.random() * traitResponses.length)];
      }
    }

    // Default response
    return "喵~ 我听到你在说话，但我不太明白...";
  }

  public updateEmotion(delta: number): void {
    this.state.currentEmotion = Math.max(
      this.state.personality.emotionalRange.min,
      Math.min(
        this.state.personality.emotionalRange.max,
        this.state.currentEmotion + delta
      )
    );
  }

  public getEmotionLevel(): number {
    return this.state.currentEmotion;
  }

  public getAvailableActions(): CatAction[] {
    return [...this.config.availableActions];
  }

  public getCatAIConfig(): CatAIConfig {
    return this.config.catAIConfig;
  }

  public getCatSystemPrompt(): string {
    const setting = this.config.prompt;
    const examples = this.config.catAIConfig.LLMConfig?.SystemExamples;
    let exampleText = "";
    if (examples && examples.length > 0) {
      exampleText = examples.map(item => item.trim()).join("\n\n"); // 每个示例用两个换行分隔
    }
    return `${setting}\n\n以下是参考的与用户的对话，请使用类似的风格进行对话\n${exampleText}`;
  }
}
