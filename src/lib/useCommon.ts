/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VERTC, { MediaType } from '@volcengine/rtc';
import Utils from '@/utils/utils';
import RtcClient from '@/lib/RtcClient';
import {
  clearCurrentMsg,
  localJoinRoom,
  localLeaveRoom,
  updateAIGCState,
  updateLocalUser,
} from '@/store/slices/room';

import useRtcListeners from '@/lib/listenerHooks';
import { RootState } from '@/store';

import {
  updateMediaInputs,
  updateSelectedDevice,
  setDevicePermissions,
} from '@/store/slices/device';
import logger from '@/utils/logger';
import aigcConfig from '@/config';
import {VirtualCat} from "@/lib/cat";

export interface FormProps {
  username: string;
  roomId: string;
  currentCat: VirtualCat;
  publishAudio: boolean;
}

export const useDeviceState = () => {
  const dispatch = useDispatch();
  const room = useSelector((state: RootState) => state.room);
  const localUser = room.localUser;
  const isAudioPublished = localUser.publishAudio;
  const isVideoPublished = localUser.publishVideo;
  const isScreenPublished = localUser.publishScreen;
  const queryDevices = async (type: MediaType) => {
    const mediaDevices = await RtcClient.getDevices({
      audio: type === MediaType.AUDIO,
      video: type === MediaType.VIDEO,
    });
    if (type === MediaType.AUDIO) {
      dispatch(
        updateMediaInputs({
          audioInputs: mediaDevices.audioInputs,
        })
      );
      dispatch(
        updateSelectedDevice({
          selectedMicrophone: mediaDevices.audioInputs[0]?.deviceId,
        })
      );
    } else {
      dispatch(
        updateMediaInputs({
          videoInputs: mediaDevices.videoInputs,
        })
      );
      dispatch(
        updateSelectedDevice({
          selectedCamera: mediaDevices.videoInputs[0]?.deviceId,
        })
      );
    }
    return mediaDevices;
  };

  const switchMic = async (controlPublish = true) => {
    if (controlPublish) {
      await (!isAudioPublished
        ? RtcClient.publishStream(MediaType.AUDIO)
        : RtcClient.unpublishStream(MediaType.AUDIO));
    }
    queryDevices(MediaType.AUDIO);
    await (!isAudioPublished ? RtcClient.startAudioCapture() : RtcClient.stopAudioCapture());
    dispatch(
      updateLocalUser({
        publishAudio: !isAudioPublished,
      })
    );
  };

  const switchCamera = async (controlPublish = true) => {
    if (controlPublish) {
      await (!isVideoPublished
        ? RtcClient.publishStream(MediaType.VIDEO)
        : RtcClient.unpublishStream(MediaType.VIDEO));
    }
    queryDevices(MediaType.VIDEO);
    await (!isVideoPublished ? RtcClient.startVideoCapture() : RtcClient.stopVideoCapture());
    dispatch(
      updateLocalUser({
        publishVideo: !isVideoPublished,
      })
    );
  };

  const switchScreenCapture = async (controlPublish = true) => {
    try {
      if (controlPublish) {
        await (!isScreenPublished
          ? RtcClient.publishScreenStream(MediaType.VIDEO)
          : RtcClient.unpublishScreenStream(MediaType.VIDEO));
      }
      await (!isScreenPublished ? RtcClient.startScreenCapture() : RtcClient.stopScreenCapture());
      dispatch(
        updateLocalUser({
          publishScreen: !isScreenPublished,
        })
      );
    } catch {
      console.warn('Not Authorized.');
    }
  };

  return {
    isAudioPublished,
    isVideoPublished,
    isScreenPublished,
    switchMic,
    switchCamera,
    switchScreenCapture,
  };
};

export const useGetDevicePermission = () => {
  const [permission, setPermission] = useState<{
    audio: boolean;
  }>();

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const permission = await RtcClient.checkPermission();
      dispatch(setDevicePermissions(permission));
      setPermission(permission);
    })();
  }, [dispatch]);
  return permission;
};

export const useJoin = (): [
  boolean,
  (formValues: FormProps, fromRefresh: boolean) => Promise<void | boolean>
] => {
  const devicePermissions = useSelector((state: RootState) => state.device.devicePermissions);
  const room = useSelector((state: RootState) => state.room);

  const dispatch = useDispatch();

  const { switchMic } = useDeviceState();
  const [joining, setJoining] = useState(false);
  const listeners = useRtcListeners();

  const handleAIGCModeStart = async () => {
    if (room.isAIGCEnable) {
      await RtcClient.stopAudioBot();
      dispatch(clearCurrentMsg());
      await RtcClient.startAudioBot();
    } else {
      await RtcClient.startAudioBot();
    }
    dispatch(updateAIGCState({ isAIGCEnable: true }));
  };

  async function disPatchJoin(formValues: FormProps): Promise<boolean | undefined> {
    if (joining) {
      return;
    }
    const { roomId, username, currentCat } = formValues;
    if (!currentCat) {
      return;
    }

    const isSupported = await VERTC.isSupported();
    if (!isSupported) {
      // Modal.error({
      //   title: '不支持 RTC',
      //   content: '您的浏览器可能不支持 RTC 功能，请尝试更换浏览器或升级浏览器后再重试。',
      // });
      console.error('浏览器不支持 RTC 功能');
      return;
    }

    setJoining(true);

    const token = await RtcClient.requestToken(roomId, username);

    if (!token) {
      // Modal.error({
      //   title: '获取 token 失败',
      //   content: '请检查网络连接或稍后再试。',
      // });
      console.error('获取 token 失败，请检查网络连接或后端服务。');
      setJoining(false);
      return;
    }

    /** 1. Create RTC Engine */
    const engineParams = {
      appId: aigcConfig.BaseConfig.AppId,
      roomId,
      uid: username,
    };
    await RtcClient.createEngine(engineParams);

    /** 2.1 Set events callbacks */
    RtcClient.addEventListeners(listeners);

    /** 2.2 RTC starting to join room */
    await RtcClient.joinRoom(token!, username);
    console.log(' ------ userJoinRoom\n', `roomId: ${roomId}\n`, `uid: ${username}`);
    /** 3. Set users' devices info */
    const mediaDevices = await RtcClient.getDevices({
      audio: true,
      video: false,
    });

    dispatch(
      localJoinRoom({
        roomId,
        user: {
          username,
          userId: username,
        },
      })
    );
    dispatch(
      updateSelectedDevice({
        selectedMicrophone: mediaDevices.audioInputs[0]?.deviceId,
        selectedCamera: mediaDevices.videoInputs[0]?.deviceId,
      })
    );
    dispatch(updateMediaInputs(mediaDevices));

    setJoining(false);

    if (devicePermissions.audio) {
      try {
        await switchMic();
        // RtcClient.setAudioVolume(30);
      } catch (e) {
        logger.debug('No permission for mic');
      }
    }
    Utils.setSessionInfo({
      username,
      roomId,
      publishAudio: true,
    });

    handleAIGCModeStart();
  }

  return [joining, disPatchJoin];
};

export const useLeave = () => {
  const dispatch = useDispatch();

  return async function () {
    await Promise.all([
      RtcClient.stopAudioCapture(),
      RtcClient.stopScreenCapture(),
      RtcClient.stopVideoCapture(),
    ]);
    await RtcClient.leaveRoom();
    dispatch(localLeaveRoom());
    dispatch(updateAIGCState({ isAIGCEnable: false }));
  };
};
