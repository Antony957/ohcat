/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const { Signer } = require('@volcengine/openapi');
const fetch = require('node-fetch');
const { AccessToken, privileges } = require('./lib/AccessToken');

const app = new Koa();

/**
 * @notes 在 https://console.volcengine.com/iam/keymanage/ 获取 AK/SK
 */
const ACCOUNT_INFO = {
  /**
   * @notes 必填, 在 https://console.volcengine.com/iam/keymanage/ 获取
   */
  accessKeyId: '',
  /**
   * @notes 必填, 在 https://console.volcengine.com/iam/keymanage/ 获取
   */
  secretKey: '',
}

/**
 * @notes 在 https://console.volcengine.com/rtc/aigc/listRTC 获取
 */
const RTC_APP_ID = '';
const RTC_APP_KEY = '';

app.use(cors({
  origin: '*'
}));

app.use(bodyParser());

app.use(async ctx => {
  /**
   * @brief Generate RTC token
   */
  if (ctx.url === '/api/token' && ctx.method.toLowerCase() === 'post') {
    const { roomId, userId } = ctx.request.body;

    if (!roomId || !userId) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required parameters' };
      return;
    }

    try {
      // Generate token that expires in some time
      const token = new AccessToken(RTC_APP_ID, RTC_APP_KEY, roomId, userId);
      const expireTimestamp = Math.floor(Date.now() / 1000) + 1800; // 0.5 hour

      // Add privileges
      token.addPrivilege(privileges.PrivPublishStream, expireTimestamp);
      token.addPrivilege(privileges.PrivSubscribeStream, expireTimestamp);
      token.expireTime(expireTimestamp);

      // Generate the token string
      const tokenString = token.serialize();
      ctx.body = { token: tokenString };
    } catch (error) {
      console.error('Error generating token:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to generate token' };
    }
  }

  /**
   * @brief 代理 AIGC 的 OpenAPI 请求
   */
  else if (ctx.url.startsWith('/proxyAIGCFetch') && ctx.method.toLowerCase() === 'post') {
    const { Action, Version } = ctx.query || {};
    const body = ctx.request.body;

    /**
     * 参考 https://github.com/volcengine/volc-sdk-nodejs 可获取更多 火山 TOP 网关 SDK 的使用方式
     */
    const openApiRequestData = {
      region: 'cn-north-1',
      method: 'POST',
      params: {
        Action,
        Version,
      },
      headers: {
        Host: 'rtc.volcengineapi.com',
        'Content-type': 'application/json',
      },
      body,
    };
    const signer = new Signer(openApiRequestData, "rtc");
    signer.addAuthorization(ACCOUNT_INFO);

    /** 参考 https://www.volcengine.com/docs/6348/69828 可获取更多 OpenAPI 的信息 */
    const result = await fetch(`https://rtc.volcengineapi.com?Action=${Action}&Version=${Version}`, {
      method: 'POST',
      headers: openApiRequestData.headers,
      body: JSON.stringify(body),
    });
    const volcResponse = await result.json();
    ctx.body = volcResponse;
  } else {
    ctx.body = '<h1>404 Not Found</h1>';
  }
});

app.listen(3001, () => {
  console.log('AIGC Server is running at http://localhost:3001');
});

