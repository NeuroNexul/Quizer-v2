
const axios = require('axios');
const fetch = require('node-fetch');


const getUserGuilds = async (accessToken) => {
      // console.log(`Guild ${accessToken.data.token_type} ${accessToken.data.access_token}`);
      try {
            const response = await axios.get('https://discord.com/api/users/@me/guilds', {
                  headers: {
                        authorization: `${accessToken.token_type} ${accessToken.access_token}`
                  }
            });
            // console.log(response.data);
            return response.data;
      } catch (error) {
            console.log(error);
      }
}

const getUserInfo = async (accessToken) => {
      // console.log(accessToken);
      // console.log(`User ${accessToken.data.token_type} ${accessToken.data.access_token}`);
      try {
            const response = await axios.get('https://discord.com/api/users/@me', {
                  headers: {
                        authorization: `${accessToken.token_type} ${accessToken.access_token}`
                  }
            });
            return response.data;
      } catch (error) {
            console.log(error);
      }
}

const refreshToken = async (refresh_token) => {
      return await (await fetch('https://discord.com/api/v8/oauth2/token', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                  client_id: process.env.CLIENT_ID,
                  client_secret: process.env.CLIENT_SECRET,
                  grant_type: 'refresh_token',
                  refresh_token: refresh_token
            })
      })).json();
}


module.exports = {
      getUserGuilds,
      getUserInfo,
      refreshToken
}