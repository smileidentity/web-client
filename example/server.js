console.log("server called");
import express from "express";
import cors from 'cors';
import { v4 as UUID  } from "uuid";
import { createServer as createViteServer } from 'vite'

import dotenv from "dotenv";
dotenv.config();

import {WebApi} from "smile-identity-core";
const SIDWebAPI = WebApi;

const app = express();


app.use(express.json({ limit: "500kb" }));
app.use(express.static("public"));
app.use(cors({ origin: true, credentials: true }));
const vite = await createViteServer({
    server: { middlewareMode: false },
    appType: 'custom'
  });
  app.use(vite.middlewares)


app.post("/token", async (req, res, next) => {
  try {
    const { PARTNER_ID, API_KEY, SID_SERVER } = process.env;
	console.log(PARTNER_ID, API_KEY, SID_SERVER);
    const connection = new SIDWebAPI(
      PARTNER_ID,
      "https://webhook.site/0ffa8d44-160a-46f2-b2d1-497a16fd6d787",
      API_KEY,
      SID_SERVER
    );

    const request_params = {
      user_id: `user-${UUID()}`,
      job_id: `job-${UUID()}`,
      product: req.body.product,
      callback_url: "https://webhook.site/0ffa8d44-160a-46f2-b2d1-497a16fd6d78",
    };

    const result = await connection.get_web_token(request_params);
console.log('result', result);
    res.status(201).json({
      ...result,
      environment: SID_SERVER === '0' ? 'sandbox' : 'production',
      product: req.body.product,
      partner_id: PARTNER_ID,
      callback_url: "https://webhook.site/0ffa8d44-160a-46f2-b2d1-497a16fd6d78",
    });
  } catch (e) {
    console.error(e);
	res.status(500).json({ error: e.message });
  }
});

app.listen(8080);
