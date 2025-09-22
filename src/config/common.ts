/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

export enum ModelSourceType {
  Custom = 'Custom',
  Available = 'Available',
}

export enum CustomParamsType {
  TTS = 'TTS',
  ASR = 'ASR',
  LLM = 'LLM',
}

export enum MODEL_MODE {
  ORIGINAL = 'original',
  VENDOR = 'vendor',
  COZE = 'coze',
}

/**
 * @brief AI 音色可选值
 * @default 通用女声
 * @notes 通用女声、通用男声为默认音色, 其它皆为付费音色。
 *        音色 ID 可于 https://console.volcengine.com/speech/service/8?s=g 中开通获取。
 *        对应 "音色详情" 中, "Voice_type" 列的值。
 */
export enum VOICE_TYPE {
  '通用女声' = 'BV001_streaming',
  '通用男声' = 'BV002_streaming',
  '自定义' = 'custom_voice',
}

/**
 * @brief TTS 的 Cluster
 */
export enum TTS_CLUSTER {
  TTS = 'volcano_tts',
  MEGA = 'volcano_mega',
  ICL = 'volcano_icl',
}

/**
 * @brief TTS 的 Cluster Mapping
 */
export const TTS_CLUSTER_MAP = {
  ...(Object.keys(VOICE_TYPE).reduce(
    (map, type) => ({
      ...map,
      [type]: TTS_CLUSTER.TTS,
    }),
    {}
  ) as Record<VOICE_TYPE, TTS_CLUSTER>),
};

/**
 * @brief 模型可选值
 * @default SKYLARK_LITE_PUBLIC
 */
export enum AI_MODEL {
  DOUBAO_LITE_32K = 'Doubao-lite-32k',
  ARK_BOT = 'ArkBot',
}

/**
 * @brief 模型来源
 */
export enum AI_MODEL_MODE {
  ARK_V3 = 'ArkV3',
}

/**
 * @brief 方舟模型的 ID
 * @note 具体的模型 ID 请至 https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint?config=%7B%7D&s=g 参看/创建
 *       模型 ID 即接入点 ID, 在上述链接中表格内 "接入点名称" 列中, 类似于 "ep-2024xxxxxx-xxx" 格式即是模型 ID。
 */
export const ARK_V3_MODEL_ID: Partial<Record<AI_MODEL, string>> = {
  [AI_MODEL.DOUBAO_LITE_32K]: 'ep-20250628103536-vjp76',
};

/**
 * @brief 方舟智能体 BotID
 * @note 具体的智能体 ID 请至 https://console.volcengine.com/ark/region:ark+cn-beijing/assistant?s=g 参看/创建
 *       Bot ID 即页面上的应用 ID, 类似于 "bot-2025xxxxxx-xxx" 格式即是应用 ID。
 */
export const LLM_BOT_ID: Partial<Record<AI_MODEL, string>> = {
  [AI_MODEL.ARK_BOT]: '************** 此处填充方舟上的 Bot ID *************',
};

export enum SCENE {
  KONG = 'KONG',
}

export const Name = {
  [SCENE.KONG]: '空空',
};


export const Model = {
  [SCENE.KONG]: AI_MODEL.DOUBAO_LITE_32K,
};

export const Voice = {
  [SCENE.KONG]: VOICE_TYPE.自定义,
};

/**
 * @brief 大模型 System 角色预设指令，可用于控制模型输出, 类似 Prompt 的概念。
 */


export const getRandomWelcome = (welcomeSpeechSet: string[] | undefined) => {
  if (!welcomeSpeechSet) {
    return ""
  }
  return welcomeSpeechSet[Math.floor(Math.random() * welcomeSpeechSet.length)];
};
