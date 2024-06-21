console.log('server called');
import express from 'express';
import cors from 'cors';
import { v4 as UUID } from 'uuid';
import { createServer as createViteServer } from 'vite';

import dotenv from 'dotenv';
dotenv.config();

import { WebApi } from 'smile-identity-core';
const SIDWebAPI = WebApi;

const app = express();

app.use(express.json({ limit: '500kb' }));
app.use(express.static('public'));
app.use(cors({ origin: true, credentials: true }));
const vite = await createViteServer({
  server: { middlewareMode: false },
  appType: 'custom',
});
app.use(vite.middlewares);

const SID_SERVER_MAPPING = {
  0: 'sandbox',
  1: 'production',
};

app.post('/token', async (req, res, next) => {
  try {
    const { PARTNER_ID, API_KEY, SID_SERVER } = process.env;
    const environmentServer = SID_SERVER_MAPPING[SID_SERVER] || SID_SERVER;
    let baseServer = environmentServer;
    // the smile-identity-core client appears to append https:// to the baseServer
    // this is a workaround to prevent the client from appending https:// twice
    if (baseServer.startsWith('https://')) {
      baseServer = `${baseServer.slice(8)}/v1`;
    }

    console.log(PARTNER_ID, API_KEY, SID_SERVER);
    const connection = new SIDWebAPI(
      PARTNER_ID,
      'https://webhook.site/0ffa8d44-160a-46f2-b2d1-497a16fd6d787',
      API_KEY,
      baseServer,
    );

    const request_params = {
      user_id: `user-${UUID()}`,
      job_id: `job-${UUID()}`,
      product: req.body.product,
      callback_url: 'https://webhook.site/0ffa8d44-160a-46f2-b2d1-497a16fd6d78',
    };

    const result = await connection.get_web_token(request_params);

    const response = {
      ...result,
      environment: environmentServer,
      product: req.body.product,
      partner_id: PARTNER_ID,
      callback_url: 'https://webhook.site/0ffa8d44-160a-46f2-b2d1-497a16fd6d78',
    };

    res.status(201).json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(8080);
