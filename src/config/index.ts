/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

import { ConfigFactory } from './config';

export * from './animations';
export * from './common';

const { REACT_APP_AIGC_URL, REACT_APP_API_URL } = process.env;



export const AIGC_PROXY_HOST = REACT_APP_AIGC_URL || 'https://kong.ohcat.cc/proxyAIGCFetch';
export const API_PROXY_HOST = REACT_APP_API_URL || 'https://kong.ohcat.cc/api';

export const Config = ConfigFactory;
export default new ConfigFactory();
