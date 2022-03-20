const express = require('express');
const Router = express.Router();
const axios = require('axios');
const fetch = require('node-fetch');
const { client } = require("./bot");
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

const { getUserGuilds, getUserInfo, refreshToken } = require("./utils");


Router.post("/login", async (req, res) => {
      try {

            const { code } = req.body;

            const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
                  method: 'POST',
                  body: new URLSearchParams({
                        client_id: process.env.CLIENT_ID,
                        client_secret: process.env.CLIENT_SECRET,
                        code,
                        grant_type: 'authorization_code',
                        redirect_uri: process.env.REDIRECT_URL,
                        scope: 'identify',
                  }),
                  headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                  },
            });
            const oauthData = await oauthResult.json();

            const userInfo = await getUserInfo(oauthData);
            const userGuilds = await getUserGuilds(oauthData);
            const guild = client.guilds.fetch(process.env.GUILD_ID);

            var hash = bcrypt.hashSync(userInfo.id, salt);

            return res.status(200).cookie("id", hash).json({
                  user: userInfo,
                  guilds: userGuilds,
                  oauthData,
                  channels: (await guild).channels.cache.filter(c => { return (c.type === "GUILD_TEXT" || c.type === "GUILD_NEWS") }).map(c => { return { id: c.id, name: c.name, type: c.type } }),
            });

      } catch (error) {
            console.error(error);
            return res.status(500).json({ error });
      }
});

Router.post("/refresh", async (req, res) => {
      try {

            const { refresh_token } = req.body;

            // const data = await (await fetch('https://discord.com/api/oauth2/token/revoke', {
            const data = await refreshToken(refresh_token);

            const userInfo = await getUserInfo(data);
            const userGuilds = await getUserGuilds(data);

            // const user = await client.users.fetch(userInfo?.id);
            // console.log(user.role.cache);
            const guild = client.guilds.fetch(process.env.GUILD_ID);
            // console.log(guild);
            var hash = bcrypt.hashSync(userInfo.id, salt);

            return res.status(200).cookie("id", hash).json({
                  user: userInfo,
                  guilds: userGuilds,
                  oauthData: data,
                  channels: (await guild).channels.cache.filter(c => { return (c.type === "GUILD_TEXT" || c.type === "GUILD_NEWS") }).map(c => { return { id: c.id, name: c.name, type: c.type } }),
            });

      } catch (error) {
            console.error(error);
            return res.status(500).json({ error });
      }
});

Router.post("/getToken", async (req, res) => {
      try {
            const { code } = req.body;

            const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
                  method: 'POST',
                  body: new URLSearchParams({
                        client_id: process.env.CLIENT_ID,
                        client_secret: process.env.CLIENT_SECRET,
                        code,
                        grant_type: 'authorization_code',
                        redirect_uri: process.env.REDIRECT_URL,
                        scope: 'identify',
                  }),
                  headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                  },
            });

            const oauthData = await oauthResult.json();
            return res.status(200).json(oauthData);
      } catch (error) {
            console.error(error);
            return res.status(500).json({ error });
      }
});




module.exports = Router;