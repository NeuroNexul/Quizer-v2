
import React, { useState, useEffect } from 'react';
import style from './App.module.css';
import Login from './pages/Login';
import axios from 'axios';
import Home from './pages/home';
import Loader from './pages/Loader';

export default function App(props) {

      const [user, setUser] = useState();
      const [guilds, setGuilds] = useState();
      const [channels, setChannels] = useState([]);
      const [oauthData, setOauthData] = useState(JSON.parse(sessionStorage.getItem("oauthData")));
      const [deviceType, setDeviceType] = useState("");
      window.deviceType = "Mobile";

      async function refresh() {
            const data = await (await axios.post("/api/auth/refresh", { refresh_token: oauthData.refresh_token })).data;

            if (data.oauthData.error) {
                  setUser(null);
                  setGuilds(null);
                  setChannels([]);
                  setOauthData(null);
                  return;
            };

            setUser(data.user);
            setGuilds(data.guilds);
            setChannels(data.channels);
            setOauthData(data.oauthData);
            window.history.pushState({}, '', '/');

            sessionStorage.setItem("oauthData", JSON.stringify(data.oauthData));
      }

      useEffect(() => {
            if (oauthData && oauthData.refresh_token) {
                  refresh();
            } else {
                  setUser(null);
                  setGuilds(null);
                  setChannels([]);
                  setOauthData(null);
            }

            let hasTouchScreen = false;
            if ("maxTouchPoints" in navigator) {
                  hasTouchScreen = navigator.maxTouchPoints > 0;
            } else if ("msMaxTouchPoints" in navigator) {
                  hasTouchScreen = navigator.msMaxTouchPoints > 0;
            } else {
                  const mQ = window.matchMedia && matchMedia("(pointer:coarse)");
                  if (mQ && mQ.media === "(pointer:coarse)") {
                        hasTouchScreen = !!mQ.matches;
                  } else if ("orientation" in window) {
                        hasTouchScreen = true; // deprecated, but good fallback
                  } else {
                        // Only as a last resort, fall back to user agent sniffing
                        var UA = navigator.userAgent;
                        hasTouchScreen =
                              /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
                              /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
                  }
            }
            if (hasTouchScreen) {
                  window.deviceType = "Mobile";
                  setDeviceType("Mobile");
            } else {
                  window.deviceType = "Desktop";
                  setDeviceType("Desktop");
            }
      }, []);

      if (user === undefined) {
            return (
                  <div className={style.container}>
                        <Loader />
                  </div>
            )
      }

      if (user === null) {
            return <Login deviceType={deviceType} user={user} setUser={setUser} guilds={guilds} setGuilds={setGuilds} channels={channels} setChannels={setChannels} oauthData={oauthData} setOauthData={setOauthData} />
      } else {
            return <Home deviceType={deviceType} user={user} guilds={guilds} channels={channels} oauthData={oauthData} />
      }
}
