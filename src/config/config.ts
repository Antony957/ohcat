/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

// import { StreamIndex } from '@volcengine/rtc';
import {
  // TTS_CLUSTER,
  // ARK_V3_MODEL_ID,
  // MODEL_MODE,
  // SCENE,
  // Model,
  // AI_MODEL,
  AI_MODEL_MODE,
  // LLM_BOT_ID,
  getRandomWelcome,
} from '.';
import {useCatStore} from "@/store/catStore";
import { CatAIConfig } from '@/types/cat';
// import {VirtualCat} from "@/lib/cat";

export const CONVERSATION_SIGNATURE = 'conversation';

/**
 * @brief RTC & AIGC 配置。
 * @notes 更多参数请参考
 *        https://www.volcengine.com/docs/6348/1404673?s=g
 */
export class ConfigFactory {
  BaseConfig = {
    /**
     * @note 必填, RTC AppId 可于 https://console.volcengine.com/rtc/listRTC?s=g 中获取。
     */
    AppId: '68162f848d812c0192cf516d',
    /**
     * @brief 非必填, 按需填充。
     */
    BusinessId: undefined,
    /**
     * @brief 必填, 房间 ID, 自定义即可，例如 "Room123"。
     * @note 建议使用有特定规则、不重复的房间号名称。
     */
    RoomId: 'Room123',
    /**
     * @brief 必填, 当前和 AI 对话的用户的 ID, 自定义即可，例如 "User123"。
     */
    UserId: 'User123',
    /**
     * @brief 必填, RTC Token, 由 AppId、RoomId、UserId、时间戳等等信息计算得出。
     *        测试跑通时，可于 https://console.volcengine.com/rtc/listRTC?s=g 列表中，
     *        找到对应 AppId 行中 "操作" 列的 "临时Token" 按钮点击进行生成, 用于本地 RTC 通信进房鉴权校验。
     *        正式使用时可参考 https://www.volcengine.com/docs/6348/70121?s=g 通过代码生成 Token。
     *        建议先使用临时 Token 尝试跑通。
     * @note 生成临时 Token 时, 页面上的 RoomId / UserId 填的与此处的 RoomId / UserId 保持一致。
     */
    Token: '<token_should_be_generated_on_server_for_production>',
    /**
     * @brief 必填, TTS(语音合成) AppId, 可于 https://console.volcengine.com/speech/app?s=g 中获取, 若无可先创建应用。
     * @note 创建应用时, 需要选择 "语音合成" 服务, 并选择对应的 App 进行绑定。
     */
    TTSAppId: '4348403671',
    /**
     * @brief 已开通需要的语音合成服务的token。
     *        使用火山引擎双向流式语音合成服务时 必填。
     */
    TTSToken: 'B1_MvfGGiF1K3qecY-_28DFW4kbkegtX',
    /**
     * @brief 必填, ASR(语音识别) AppId, 可于 https://console.volcengine.com/speech/app?s=g 中获取, 若无可先创建应用。
     * @note 创建应用时, 需要按需根据语言选择 "流式语音识别" 服务, 并选择对应的 App 进行绑定。
     */
    ASRAppId: '4348403671',
    /**
     * @brief 已开通流式语音识别大模型服务 AppId 对应的 Access Token。
     * @note 使用流式语音识别 **大模型** 服务时必填, 可于 https://console.volcengine.com/speech/service/10011?AppID=6482372612&s=g 中查看。
     * 注意, 如果填写了 ASRToken, Demo 会默认使用大模型模式，请留意相关资源是否已经开通。
     * 默认为使用小模型，无需配置 ASRToken。
     */
    ASRToken: undefined,
  };

  Model = 'Doubao-lite-32k';

  /**
   * @note 必填, 音色 ID, 可具体看定义。
   *       音色 ID 获取方式可查看 VOICE_TYPE 定义
   *       此处已有默认值, 不影响跑通, 可按需修改。
   */
  VoiceType = 'S_z3C6AUZq1';

  /**
   * @note 当前使用的模型来源, 具体可参考 MODEL_MODE 定义。
   *       通过 UI 修改, 无须手动配置。
   */
  ModeSourceType = 'original';
  /**
   * @brief AI Robot 名
   * @default RobotMan_
   */
  BotName = 'RobotMan_';
  /**
   * @brief 是否为打断模式
   */
  InterruptMode = true;

  get aigcConfig() {
    const currentCat = useCatStore.getState().currentCat;
    if (!currentCat) {
      return;
    }

    const aiConfig = currentCat.getCatAIConfig();
    const systemPrompt = currentCat.getCatSystemPrompt();
    const welcome = getRandomWelcome(aiConfig.LLMConfig?.WelcomeSpeechSet);
    const llmConfig = (aiConfig: CatAIConfig) => {
      const params: Record<string, unknown> = {
        Mode: AI_MODEL_MODE.ARK_V3,
        /**
         * @note EndPointId 与 BotId 不可同时填写，若同时填写，则 EndPointId 生效。
         *       当前仅支持自定义推理接入点，不支持预置推理接入点。
         */
        EndPointId: 'ep-20250628103536-vjp76',
        MaxTokens: 150,
        Temperature: 1,
        TopP: 0.3,
        SystemMessages: [systemPrompt],
        Prefill: true,
        WelcomeSpeech: welcome,
      };
      return params;
    }
    const ttsConfig = (aiConfig: CatAIConfig) => {
        return aiConfig.TTSConfig;
    }
    const asrConfig = (aiConfig: CatAIConfig) => {
      const params : Record<string, unknown> = {
        Provider: 'volcano',
        ProviderParams: {
          Mode: 'smallmodel',
          AppId: '4348403671',
          /**
           * @note 具体流式语音识别服务对应的 Cluster ID，可在流式语音服务控制台开通对应服务后查询。
           *       具体链接为: https://console.volcengine.com/speech/service/16?s=g
           */
          Cluster: 'volcengine_streaming_common',
        },
        /**
         * @note 小模型情况下, 建议使用 VAD 及音量采集设置, 以优化识别效果。
         */
        VADConfig: {
          SilenceTime: 600,
          SilenceThreshold: 200,
        },
        VolumeGain: 0.3,
      };
      return params;
    }

    return {
      Config: {
        LLMConfig: llmConfig(aiConfig),
        TTSConfig: ttsConfig(aiConfig),
        ASRConfig: asrConfig(aiConfig),
        InterruptMode: this.InterruptMode ? 0 : 1,
        SubtitleConfig: {
          SubtitleMode: 1,
        },
      },
      AgentConfig: {
        UserId: this.BotName,
        WelcomeMessage: welcome,
        EnableConversationStateCallback: true,
        ServerMessageSignatureForRTS: CONVERSATION_SIGNATURE,
      },
    };
  }
}
