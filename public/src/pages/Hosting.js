import React, { useState, useEffect } from 'react'
import style from './Hosting.module.scss';
import BLOB from './BLOB';
import axios from "axios";
import Scrollbar from 'react-smooth-scrollbar';

import MobileDateTimePicker from '@mui/lab/MobileDateTimePicker';
import DesktopDateTimePicker from '@mui/lab/DesktopDateTimePicker';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

/**
 * Load SVGS
 */
import { ReactComponent as Zero } from '../assets/svg/0.svg';
import { ReactComponent as One } from '../assets/svg/1.svg';
import { ReactComponent as Two } from '../assets/svg/2.svg';
import { ReactComponent as Three } from '../assets/svg/3.svg';
import { ReactComponent as Four } from '../assets/svg/4.svg';
import { ReactComponent as Five } from '../assets/svg/5.svg';
import { ReactComponent as Six } from '../assets/svg/6.svg';
import { ReactComponent as Seven } from '../assets/svg/7.svg';
import { ReactComponent as Eight } from '../assets/svg/8.svg';
import { ReactComponent as Nine } from '../assets/svg/9.svg';
import { ReactComponent as Ten } from '../assets/svg/10.svg';
import { ReactComponent as Close } from '../assets/svg/close.svg';
import { ReactComponent as Plus } from '../assets/svg/plus.svg';
const Numbers = props => {
      const numbers = [Zero, One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten];
      return React.createElement(numbers[props.index], null);
}

const Scroll = (props) => {
      if (props.deviceType === "Mobile") {
            return <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
                  {props.children}
            </div>
      } else {
            return <Scrollbar style={{ width: "100%", height: "100%" }}>
                  {props.children}
            </Scrollbar>
      }
}

export default function Hosting(props) {

      const [data, setData] = useState(props.updateQuiz ? {
            ...props.updateQuiz,
            hostingChannel: props.updateQuiz.hostingChannel.id,
            winningChannel: props.updateQuiz.winningChannel.id,
            author: props.user
      } : {
            question: "",
            options: ["", "", "", ""],
            inline: false,
            answer: 1,
            categories: [],
            difficulty: "Easy",
            timeToStart: new Date().getTime(),
            timeToEnd: new Date().getTime(),
            hostingChannel: "",
            winningChannel: "",
            author: props.user
      });
      const [saving, setSaving] = useState(false);

      const save = async () => {
            try {
                  setSaving(true);
                  if (!props.updateQuiz) {
                        const res = await (await axios.post("/api/quiz/create", data)).data;
                  } else {
                        await (await axios.post(`/api/quiz/update/${props.updateQuiz._id}`, data)).data;
                  }
                  setSaving(false);
                  props.setSnakeBar({
                        open: true,
                        message: !props.updateQuiz ? "Quiz saved successfully" : "Quiz updated successfully",
                        severity: "success"
                  });
                  props.getQuizes();
                  props.setHost(false);
                  props.setUpdateQuiz(null);
            } catch (err) {
                  console.log(err);
                  setSaving(false);
                  props.setSnakeBar({
                        open: true,
                        message: !props.updateQuiz ? "Error saving quiz" : "Error updating quiz",
                        severity: "error"
                  });
            }
      }

      return (
            <>
                  <div className={style.container} >
                        <BLOB fill="#ffffff08" className={style.canvas} onClick={e => { props.updateQuiz ? props.setUpdateQuiz(null) : props.setHost(false) }} />

                        <div className={style.main}>

                              <Close style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    cursor: "pointer",
                                    width: "30px",
                                    height: "30px",
                                    zIndex: "3"
                              }}
                                    onClick={e => { props.updateQuiz ? props.setUpdateQuiz(null) : props.setHost(false) }} />
                              <Scroll deviceType={props.deviceType}>

                                    <div className={style.form}>

                                          <h2>Host A New Quiz</h2>

                                          <div className={style.input}>
                                                <label>Question*</label>
                                                <p>You can use MarkDown here...</p>
                                                <textarea
                                                      placeholder='Enter Your Question Here...'
                                                      onChange={e => { setData(data => ({ ...data, question: e.target.value })); }}
                                                      value={data.question}
                                                ></textarea>
                                          </div>

                                          <div className={style.input}>
                                                <h3>Options</h3>
                                                <p>You can use MarkDown here...</p>
                                                <FormControlLabel
                                                      control={
                                                            <Checkbox
                                                                  inputProps={{ 'aria-label': 'Checkbox demo' }}
                                                                  sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                                                  checked={data?.inline}
                                                                  onChange={e => { setData({ ...data, inline: e.target.checked }); }}
                                                            />
                                                      }
                                                      label="INLINE OPTIONS"
                                                />

                                                {data?.options?.map((option, index) => <div key={index} className={style.option}>
                                                      <div className={style.img}>
                                                            <Numbers index={index + 1} />

                                                            <Plus onClick={e => {
                                                                  const currentOptions = data.options;
                                                                  if (currentOptions.length < 10) {
                                                                        const newOptions = [
                                                                              ...currentOptions.slice(0, index + 1),
                                                                              "",
                                                                              ...currentOptions.slice(index + 1)
                                                                        ];
                                                                        setData({
                                                                              ...data,
                                                                              options: newOptions
                                                                        });
                                                                  }
                                                            }} />

                                                            <Close onClick={e => {
                                                                  const currentOptions = data.options;
                                                                  if (currentOptions.length > 1) {
                                                                        currentOptions.splice(index, 1);
                                                                        setData({
                                                                              ...data,
                                                                              options: currentOptions
                                                                        });
                                                                  }
                                                            }} />

                                                            <input type="checkbox" checked={data.answer === index + 1} onClick={e => { setData({ ...data, answer: index + 1 }); }} onChange={e => { }} />
                                                      </div>
                                                      <textarea placeholder='Enter Your Option Here...' onChange={e => {
                                                            const newOptions = data.options;
                                                            newOptions[index] = e.target.value;
                                                            setData({ ...data, options: newOptions });
                                                      }} value={option}></textarea>
                                                </div>)}

                                          </div>

                                          <Stack spacing={2} >
                                                <div className={style.datePicker}>
                                                      <LocalizationProvider dateAdapter={AdapterDateFns}>

                                                            {props.deviceType === "Mobile" ?
                                                                  <MobileDateTimePicker
                                                                        value={data.timeToStart}
                                                                        label="Starting Time"
                                                                        onChange={(newValue) => {
                                                                              setData({ ...data, timeToStart: newValue.valueOf() });
                                                                        }}
                                                                        minDateTime={new Date()}
                                                                        renderInput={(params) => <TextField {...params} />}
                                                                  />
                                                                  :
                                                                  <DesktopDateTimePicker
                                                                        value={data.timeToStart}
                                                                        label="Starting Time"
                                                                        onChange={(newValue) => {
                                                                              setData({ ...data, timeToStart: newValue.valueOf() });
                                                                        }}
                                                                        minDateTime={new Date()}
                                                                        renderInput={(params) => <TextField {...params} />}
                                                                  />
                                                            }

                                                            {props.deviceType === "Mobile" ?
                                                                  <MobileDateTimePicker
                                                                        value={data.timeToEnd}
                                                                        label="Ending Time"
                                                                        onChange={(newValue) => {
                                                                              setData({ ...data, timeToEnd: newValue.valueOf() });
                                                                        }}
                                                                        minDateTime={data.timeToStart}
                                                                        renderInput={(params) => <TextField {...params} />}
                                                                  />
                                                                  :
                                                                  <DesktopDateTimePicker
                                                                        value={data.timeToEnd}
                                                                        label="Ending Time"
                                                                        onChange={(newValue) => {
                                                                              setData({ ...data, timeToEnd: newValue.valueOf() });
                                                                        }}
                                                                        minDateTime={data.timeToStart}
                                                                        renderInput={(params) => <TextField {...params} />}
                                                                  />
                                                            }

                                                      </LocalizationProvider>
                                                </div>

                                                <div className={style.input2}>
                                                      <Stack spacing={2} >
                                                            <FormControl fullWidth>
                                                                  <InputLabel id="demo-simple-select-label">Difficulty</InputLabel>
                                                                  <Select
                                                                        labelId="demo-simple-select-label"
                                                                        id="demo-simple-select"
                                                                        value={data.difficulty}
                                                                        label="Difficulty"
                                                                        onChange={e => { setData({ ...data, difficulty: e.target.value }); }}
                                                                  >
                                                                        <MenuItem value="Easy">Easy</MenuItem>
                                                                        <MenuItem value="Normal">Normal</MenuItem>
                                                                        <MenuItem value="Hard">Hard</MenuItem>
                                                                  </Select>
                                                            </FormControl>

                                                            <TextField fullWidth id="outlined-basic" label="Categories" value={data.categories.join(",")} onChange={e => { setData({ ...data, categories: e.target.value.split(",") }); }} variant="outlined" />

                                                            <FormControl fullWidth>
                                                                  <InputLabel id="demo-simple-select-label">Hosting Channel</InputLabel>
                                                                  <Select
                                                                        labelId="demo-simple-select-label"
                                                                        id="demo-simple-select"
                                                                        value={data.hostingChannel}
                                                                        label="Hosting Channel"
                                                                        onChange={e => { setData({ ...data, hostingChannel: e.target.value }); }}
                                                                  >
                                                                        {props.channels.map((c) => (
                                                                              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                                                        ))}
                                                                  </Select>
                                                            </FormControl>

                                                            <FormControl fullWidth>
                                                                  <InputLabel id="demo-simple-select-label">Winning Channel</InputLabel>
                                                                  <Select
                                                                        labelId="demo-simple-select-label"
                                                                        id="demo-simple-select"
                                                                        value={data.winningChannel}
                                                                        label="Winning Channel"
                                                                        onChange={e => { setData({ ...data, winningChannel: e.target.value }); }}
                                                                  >
                                                                        {props.channels.map((c) => (
                                                                              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                                                        ))}
                                                                  </Select>
                                                            </FormControl>

                                                            <LoadingButton
                                                                  loading={saving}
                                                                  loadingPosition="start"
                                                                  startIcon={<SaveIcon />}
                                                                  variant="outlined"
                                                                  onClick={save}
                                                            >
                                                                  Save
                                                            </LoadingButton>

                                                      </Stack>
                                                </div>

                                          </Stack>
                                    </div>

                              </Scroll>
                        </div>

                  </div>
            </>
      )
}
