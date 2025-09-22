/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

export interface AnimationProps {
  path: string;
  totalFrames: number;
  repeat?: number;
}

export const AnimationsGreet: AnimationProps[] = [
  {
    path: '8-greeting',
    totalFrames: 150,
  },
];

export const AnimationsListen: AnimationProps[] = [
  {
    path: '3-nod',
    totalFrames: 80,
  },
  {
    path: '9-waiting',
    totalFrames: 240,
    repeat: 2,
  },
  {
    path: '6-think',
    totalFrames: 90,
  },
  {
    path: '9-waiting',
    totalFrames: 240,
    repeat: 2,
  },
];

export const AnimationsTalk: AnimationProps[] = [
  {
    path: '2-talk',
    totalFrames: 120,
  },
  {
    path: '1-talk',
    totalFrames: 310,
  },
  {
    path: '5-left_hand',
    totalFrames: 114,
  },
];

export const AnimationsDance: AnimationProps[] = [
  {
    path: '7-dance',
    totalFrames: 72,
  },
];

export default {
  AnimationsGreet,
  AnimationsListen,
  AnimationsTalk,
  AnimationsDance,
};
