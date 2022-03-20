import React, { useState, useEffect } from 'react'
import BLOB from './BLOB';
import style from './Login.module.css';
import logo from "../assets/logo/logo.png";
import axios from 'axios';
import LoadingButton from '@mui/lab/LoadingButton';

export default function Login(props) {

      const [loginState, setLoginState] = useState(true);

      async function login(code) {
            try {
                  const data = await (await axios.post("/api/auth/login", { code })).data;
                  console.log(data);

                  if (data.oauthData.error || data.error) {
                        props.setUser(null);
                        props.setGuilds(null);
                        props.setOauthData(null);
                        setLoginState(false);
                        window.history.pushState({}, '', '/');
                        return;
                  };
                  
                  props.setUser(data.user);
                  props.setGuilds(data.guilds);
                  props.setOauthData(data.oauthData);
                  window.history.pushState({}, '', '/');
                  
                  sessionStorage.setItem("oauthData", JSON.stringify(data.oauthData));
            } catch (err) {
                  console.log(err);
                  props.setUser(null);
                  props.setGuilds(null);
                  props.setOauthData(null);
                  setLoginState(false);
                  window.history.pushState({}, '', '/');
            }
      }

      useEffect(() => {

            const urlSearchParams = new URLSearchParams(window.location.search);
            const params = Object.fromEntries(urlSearchParams.entries());

            if (!params.code) {
                  props.setUser(null);
                  props.setGuilds(null);
                  props.setOauthData(null);
                  setLoginState(false);
                  return;
            };

            login(params.code);
      }, [])

      return (
            <>
                  <BLOB fill="#ffffff08" className={style.canvas} />
                  <div className={style.container}>

                        <div className={style.head}>
                              <img src={logo} alt="logo" />
                              <h2>QUIZER</h2>
                        </div>

                        <div className={style.form}>
                              <div className={style.box}>
                                    <h3>Login</h3>
                                    <LoadingButton loading={loginState} variant="contained" fullWidth className={style.button} onClick={e => {
                                          window.location.href = window.location.origin === "https://quiz-er.herokuapp.com" ?
                                                "https://discord.com/api/oauth2/authorize?client_id=948134556664483840&redirect_uri=https%3A%2F%2Fquiz-er.herokuapp.com&response_type=code&scope=identify%20email%20guilds"
                                                :
                                                `https://discord.com/api/oauth2/authorize?client_id=948134556664483840&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&scope=identify%20email%20guilds`;
                                    }}>
                                          LOGIN WITH DISCORD
                                    </LoadingButton>
                                    {/* {!loginState ?
                                          <a href="https://discord.com/api/oauth2/authorize?client_id=948134556664483840&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&scope=identify%20email%20guilds">LOGIN WITH DISCORD</a>
                                          :
                                          <div>Loading...</div>
                                    } */}
                              </div>
                        </div>

                  </div>
            </>
      )
}
