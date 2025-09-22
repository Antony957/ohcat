/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { createSlice } from '@reduxjs/toolkit';
import {
  AudioPropertiesInfo,
  LocalAudioStats,
  NetworkQuality,
  RemoteAudioStats,
} from '@volcengine/rtc';
import config, { MODEL_MODE, SCENE } from '@/config';

export interface IUser {
  username?: string;
  userId?: string;
  publishAudio?: boolean;
  publishVideo?: boolean;
  publishScreen?: boolean;
  audioStats?: RemoteAudioStats;
  audioPropertiesInfo?: AudioPropertiesInfo;
}

export type LocalUser = Omit<IUser, 'audioStats'> & {
  loginToken?: string;
  audioStats?: LocalAudioStats;
};

export interface Msg {
  value: string;
  time: number;
  user: string;
  paragraph?: boolean;
  definite?: boolean;
  isInterrupted?: boolean;
}

export interface RoomState {
  time: number;
  roomId?: string;
  localUser: LocalUser;
  remoteUsers: IUser[];
  autoPlayFailUser: string[];
  /**
   * @brief 是否已加房
   */
  isJoined: boolean;
  /**
   * @brief 选择的模式
   */
  scene: SCENE;

  /**
   * @brief AI 通话是否启用
   */
  isAIGCEnable: boolean;
  /**
   * @brief AI 是否正在说话
   */
  isAITalking: boolean;
  /**
   * @brief AI 配置
   */
  aiConfig?: any;
  /**
   * @brief 模型模式
   */
  modelMode?: any;
  /**
   * @brief 网络质量
   */
  networkQuality: NetworkQuality;

  /**
   * @brief 对话记录
   */
  msgHistory: Msg[];

  /**
   * @brief 当前的对话
   */
  currentConversation: {
    [user: string]: {
      /**
       * @brief 实时对话内容
       */
      msg: string;
      /**
       * @brief 当前实时对话内容是否能被定义为 "问题"
       */
      definite: boolean;
    };
  };
}

const initialState: RoomState = {
  time: -1,
  scene: SCENE.KONG,
  remoteUsers: [],
  localUser: {
    publishAudio: false,
    publishVideo: false,
    publishScreen: false,
  },
  autoPlayFailUser: [],
  isJoined: false,
  isAIGCEnable: false,
  isAITalking: false,
  networkQuality: NetworkQuality.UNKNOWN,

  msgHistory: [],
  currentConversation: {},
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    localJoinRoom: (
      state,
      {
        payload,
      }: {
        payload: {
          roomId: string;
          user: LocalUser;
        };
      }
    ) => {
      state.roomId = payload.roomId;
      state.localUser = {
        ...state.localUser,
        ...payload.user,
      };
      state.isJoined = true;
    },
    localLeaveRoom: (state) => {
      state.roomId = undefined;
      state.time = -1;
      state.localUser = {
        publishAudio: false,
        publishVideo: false,
        publishScreen: false,
      };
      state.remoteUsers = [];
      state.isJoined = false;
    },
    remoteUserJoin: (state, { payload }) => {
      state.remoteUsers.push(payload);
    },
    remoteUserLeave: (state, { payload }) => {
      const findIndex = state.remoteUsers.findIndex((user) => user.userId === payload.userId);
      state.remoteUsers.splice(findIndex, 1);
    },

    updateScene: (state, { payload }) => {
      state.scene = payload.scene;
    },

    updateLocalUser: (state, { payload }: { payload: Partial<LocalUser> }) => {
      state.localUser = {
        ...state.localUser,
        ...(payload || {}),
      };
    },

    updateNetworkQuality: (state, { payload }) => {
      state.networkQuality = payload.networkQuality;
    },

    updateRemoteUser: (state, { payload }: { payload: IUser | IUser[] }) => {
      if (!Array.isArray(payload)) {
        payload = [payload];
      }

      payload.forEach((user) => {
        const findIndex = state.remoteUsers.findIndex((u) => u.userId === user.userId);
        state.remoteUsers[findIndex] = {
          ...state.remoteUsers[findIndex],
          ...user,
        };
      });
    },

    updateRoomTime: (state, { payload }) => {
      state.time = payload.time;
    },

    addAutoPlayFail: (state, { payload }) => {
      const autoPlayFailUser = state.autoPlayFailUser;
      const index = autoPlayFailUser.findIndex((item) => item === payload.userId);
      if (index === -1) {
        state.autoPlayFailUser.push(payload.userId);
      }
    },
    removeAutoPlayFail: (state, { payload }) => {
      const autoPlayFailUser = state.autoPlayFailUser;
      const _autoPlayFailUser = autoPlayFailUser.filter((item) => item !== payload.userId);
      state.autoPlayFailUser = _autoPlayFailUser;
    },
    clearAutoPlayFail: (state) => {
      state.autoPlayFailUser = [];
    },
    updateAIGCState: (state, { payload }) => {
      state.isAIGCEnable = payload.isAIGCEnable;
    },
    updateAITalkState: (state, { payload }) => {
      state.isAITalking = payload.isAITalking;
    },
    updateAIConfig: (state, { payload }) => {
      state.aiConfig = Object.assign(state.aiConfig, payload);
    },
    updateModelMode: (state, { payload }) => {
      state.modelMode = payload;
    },
    clearHistoryMsg: (state) => {
      state.msgHistory = [];
    },
    setHistoryMsg: (state, { payload }) => {
      const { paragraph, definite } = payload;
      const lastMsg = state.msgHistory.at(-1)! || {};
      /** 是否需要再创建新句子 */
      const fromBot = payload.user === config.BotName;
      /**
       * Bot 的语句以 definite 判断是否需要追加新内容
       * User 的语句以 paragraph 判断是否需要追加新内容
       */
      const lastMsgCompleted = fromBot ? lastMsg.definite : lastMsg.paragraph;

      if (state.msgHistory.length) {
        /** 如果上一句话是完整的则新增语句 */
        if (lastMsgCompleted) {
          state.msgHistory.push({
            value: payload.text,
            time: Date.now(),
            user: payload.user,
            definite,
            paragraph,
          });
        } else {
          /** 话未说完, 更新文字内容 */
          lastMsg.value = payload.text;
          lastMsg.time = Date.now(),
          lastMsg.paragraph = paragraph;
          lastMsg.definite = definite;
          lastMsg.user = payload.user;
        }
      } else {
        /** 首句话首字不会被打断 */
        state.msgHistory.push({
          value: payload.text,
          time: Date.now(),
          user: payload.user,
          paragraph,
        });
      }
    },
    clearCurrentMsg: (state) => {
      state.currentConversation = {};
      state.msgHistory = [];
    },
    setInterruptMsg: (state) => {
      // 设置打断消息的逻辑
      const lastMsg = state.msgHistory.at(-1);
      if (lastMsg) {
        lastMsg.isInterrupted = true;
      }
    },
  },
});

export const {
  localJoinRoom,
  localLeaveRoom,
  remoteUserJoin,
  remoteUserLeave,
  updateRemoteUser,
  updateLocalUser,
  updateRoomTime,
  addAutoPlayFail,
  removeAutoPlayFail,
  clearAutoPlayFail,
  updateAIGCState,
  updateAITalkState,
  updateAIConfig,
  updateModelMode,
  setHistoryMsg,
  clearHistoryMsg,
  clearCurrentMsg,
  setInterruptMsg,
  updateNetworkQuality,
  updateScene,
} = roomSlice.actions;

export default roomSlice.reducer;
