
import React, { useState, useEffect } from 'react'
import style from './home.module.css';
import BLOB from './BLOB';
import Hosting from './Hosting';
import logo from "../assets/logo/logo.png";
import axios from "axios";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import MuiAlert from '@mui/material/Alert';

const darkTheme = createTheme({
      palette: {
            mode: 'dark',
      },
});

const Alert = React.forwardRef(function Alert(props, ref) {
      return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


function getScrollbarWidth() {
      // Creating invisible container
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll'; // forcing scrollbar to appear
      outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
      document.body.appendChild(outer);
      // Creating inner element and placing it in the container
      const inner = document.createElement('div');
      outer.appendChild(inner);
      // Calculating difference between container's full width and the child width
      const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
      // Removing temporary elements from the DOM
      outer.parentNode.removeChild(outer);
      return scrollbarWidth;
}



export default function Home(props) {

      const [profile, setProfile] = useState(false);
      const [host, setHost] = useState(false);
      const [quizes, setQuizes] = useState([]);
      const [updateQuiz, setUpdateQuiz] = useState(null);
      const [deleting, setDeleting] = useState(false);
      const [snakeBar, setSnakeBar] = useState({
            message: "Hello World",
            open: false,
            severity: "success",
      });

      async function getQuizes() {
            try {
                  setDeleting(true);
                  const data = await (await axios.post("/api/quiz/getAllQuizes", { author: props.user })).data;
                  setQuizes(data.quizes);
                  setDeleting(false);
            } catch (err) {
                  console.log(err);
                  setDeleting(false);
                  setSnakeBar({
                        message: "Error getting quizes",
                        open: true,
                        severity: "error",
                  });
            }
      }

      async function deleteQuiz(id) {
            try {

                  setDeleting(true);
                  await axios.post("/api/quiz/delete/" + id, { author: props.user });
                  await getQuizes();
                  setSnakeBar({
                        message: "Quiz deleted",
                        open: true,
                        severity: "success",
                  });
                  setDeleting(false);

            } catch (err) {
                  console.log(err);
                  setSnakeBar({
                        message: "Error deleting quiz",
                        open: true,
                        severity: "error",
                  });
                  setDeleting(false);
            }
      }

      useEffect(() => {

            getQuizes();
            return () => {
            }
      }, [])


      return (
            <>
                  <ThemeProvider theme={darkTheme}>
                        <BLOB fill="#ffffff08" className={style.canvas} />

                        <Backdrop
                              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                              open={deleting}>
                              <CircularProgress color="inherit" />
                        </Backdrop>

                        <Snackbar
                              open={snakeBar.open}
                              onClose={(e, r) => { if (r === 'clickaway') return; setSnakeBar(prev => ({ ...prev, open: false })) }}
                              TransitionComponent={(props) => {
                                    return <Slide {...props} direction="right" />;
                              }}
                        >
                              <Alert onClose={(e, r) => { if (r === 'clickaway') return; setSnakeBar(prev => ({ ...prev, open: false })) }} severity={snakeBar.severity} sx={{ width: '100%' }}>
                                    {snakeBar.message}
                              </Alert>
                        </Snackbar>

                        {profile &&
                              <div className={style.profileHolder} onClick={e => { setProfile(!profile); }}>
                                    <div className={style.profile} onClick={e => { e.stopPropagation(); }}>
                                          <div className={style.dpHolder}>
                                                <div className={style.banner} style={{ backgroundColor: props.user.banner_color }}></div>
                                                <img className={style.dp} alt={props.user.username} src={`https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatar}.png`} />
                                          </div>
                                          <div className={style.data}>
                                                <div className={style.username}>{props.user.username}<span className={style.discriminator}>#{props.user.discriminator}</span></div>
                                                <p className={style.fields}><span>Numbers of servers: </span>{props.guilds?.length}</p>
                                                <p className={style.fields}><span>User Id: </span>{props.user.id}</p>
                                                <p className={style.fields}><span>Email Address: </span>{props.user.email}</p>
                                          </div>
                                    </div>
                              </div>
                        }

                        {host && <Hosting updateQuiz={updateQuiz} setSnakeBar={setSnakeBar} setUpdateQuiz={setUpdateQuiz} deviceType={props.deviceType} host={host} setHost={setHost} oauthData={props.oauthData} user={props.user} getQuizes={getQuizes} channels={props.channels} />}
                        {updateQuiz && <Hosting updateQuiz={updateQuiz} setSnakeBar={setSnakeBar} setUpdateQuiz={setUpdateQuiz} deviceType={props.deviceType} host={host} setHost={setHost} oauthData={props.oauthData} user={props.user} getQuizes={getQuizes} channels={props.channels} />}

                        <div className={style.container}>

                              <div className={style.head}>
                                    <img src={logo} alt="logo" />
                                    <h2>QUIZER</h2>
                                    <div className={style.ProfileButton} onClick={e => { setProfile(!profile); }}>
                                          <img className={style.profileDp} alt={props.user.username} src={`https://cdn.discordapp.com/avatars/${props.user.id}/${props.user.avatar}.png`} />
                                    </div>
                              </div>

                              <main className={style.main}>

                                    <div className={style.actionBar}>

                                          <div className={style.action}>
                                                <span onClick={e => { setHost(!host) }}>Create New Quiz</span>
                                          </div>
                                          <div className={style.action}>
                                                <span onClick={e => { getQuizes(); }}>Refresh</span>
                                          </div>

                                    </div>

                                    <div className={style.quizes_list}>

                                          <TableContainer sx={{
                                                width: 'auto',
                                                position: "absolute",
                                                top: 0,
                                                bottom: `-${getScrollbarWidth()}px`,
                                                left: 0,
                                                right: `-${getScrollbarWidth()}px`,
                                                overflow: "scroll",
                                          }}>
                                                <Table stickyHeader size="medium" aria-label="sticky table" style={{

                                                }}>
                                                      <TableHead>
                                                            <TableRow>
                                                                  <TableCell>S.No.</TableCell>
                                                                  <TableCell>State</TableCell>
                                                                  <TableCell>Categories</TableCell>
                                                                  <TableCell>Difficulty</TableCell>
                                                                  <TableCell>Time To Start</TableCell>
                                                                  <TableCell>Time To End</TableCell>
                                                                  <TableCell>Created At</TableCell>
                                                                  <TableCell>Updated At</TableCell>
                                                                  <TableCell>Created By</TableCell>
                                                                  <TableCell>Updated By</TableCell>
                                                                  <TableCell>Hosting Channel</TableCell>
                                                                  <TableCell>Winning Channel</TableCell>
                                                                  <TableCell>Actions</TableCell>
                                                            </TableRow>
                                                      </TableHead>
                                                      <TableBody>
                                                            {quizes?.map((row, index) => {
                                                                  return (
                                                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                                                              <TableCell>{row.number}</TableCell>
                                                                              <TableCell style={{
                                                                                    color: row.state === 1 ? "#f00" : row.state === 2 ? "#ff0" : "#0ff"
                                                                              }}>{row.state === 1 ? "Yet to be hosted" : row.state === 2 ? "Hosted" : "Winner Decleared"}</TableCell>
                                                                              <TableCell>{row.categories.join(",")}</TableCell>
                                                                              <TableCell>{row.difficulty}</TableCell>
                                                                              <TableCell>{(new Date(row.timeToStart)).toLocaleString()}</TableCell>
                                                                              <TableCell>{(new Date(row.timeToEnd)).toLocaleString()}</TableCell>
                                                                              <TableCell>{(new Date(row.createdAt)).toLocaleString()}</TableCell>
                                                                              <TableCell>{(new Date(row.updatedAt)).toLocaleString()}</TableCell>
                                                                              <TableCell>
                                                                                    <Chip
                                                                                          avatar={<Avatar alt="Natacha" src={`https://cdn.discordapp.com/avatars/${row.createdBy.id}/${row.createdBy.avatar}.png`} />}
                                                                                          label={`${row.createdBy.username}#${row.createdBy.discriminator}`}
                                                                                          variant="outlined"
                                                                                    />
                                                                              </TableCell>
                                                                              <TableCell>
                                                                                    <Chip
                                                                                          avatar={<Avatar alt="Natacha" src={`https://cdn.discordapp.com/avatars/${row.updatedBy.id}/${row.updatedBy.avatar}.png`} />}
                                                                                          label={`${row.updatedBy.username}#${row.updatedBy.discriminator}`}
                                                                                          variant="outlined"
                                                                                    />
                                                                              </TableCell>
                                                                              <TableCell>{row.hostingChannel.name}</TableCell>
                                                                              <TableCell>{row.winningChannel.name}</TableCell>
                                                                              <TableCell>
                                                                                    <Stack direction="row" spacing={1}>
                                                                                          <Button disabled={row.state > 1} variant="outlined" color="success" onClick={e => {
                                                                                                setUpdateQuiz(row);
                                                                                          }}>
                                                                                                EDIT
                                                                                          </Button>
                                                                                          <Button disabled={row.state > 1} variant="outlined" color="error" onClick={e => {
                                                                                                deleteQuiz(row._id);
                                                                                          }}>
                                                                                                DELETE
                                                                                          </Button>
                                                                                    </Stack>
                                                                              </TableCell>
                                                                        </TableRow>
                                                                  );
                                                            })}
                                                      </TableBody>
                                                </Table>
                                          </TableContainer>

                                    </div>

                              </main>
                        </div>
                  </ThemeProvider>
            </>
      )
}
