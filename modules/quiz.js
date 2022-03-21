const express = require('express');
const Router = express.Router();
const Quizs = require("../db/models/quiz_schema");
var bcrypt = require('bcryptjs');
const emojis = require("./emojis");
const chalk = require('chalk');

const { client, sendMessage, editMessage, getReactedUsers } = require("./bot");
const { refreshToken, getUserGuilds, getUserInfo } = require("./utils");


Router.post("/create", async (req, res) => {
      try {
            const {
                  question,
                  options,
                  inline,
                  answer,
                  categories,
                  difficulty,
                  timeToStart,
                  timeToEnd,
                  hostingChannel,
                  winningChannel,
                  author
            } = req.body;

            const isRealUser = bcrypt.compareSync(author.id, req.cookies.id);

            if (!isRealUser) {
                  return res.status(401).json({
                        status: 401,
                        error: "User doesn't have permission to manage Quizer"
                  });
            }

            // console.log(oauthData.refresh_token);
            // const data = await refreshToken(oauthData.refresh_token);
            // console.log(data);
            // const author = await getUserInfo(data);
            // console.log(author);

            const guild = client.guilds.fetch(process.env.GUILD_ID);
            const user = await (await guild).members.fetch(author.id);

            const isQuizMorderator = user._roles.includes(process.env.QUIZ_MORDERATOR_ID) || user.id === "759444802205909002";

            if (!isQuizMorderator) {
                  return res.status(401).json({
                        status: 401,
                        error: "User doesn't have permission to manage Quizer"
                  });
            }

            const lastQuiz = await Quizs.findOne().sort('-number').exec();

            const newQuiz = new Quizs({
                  number: lastQuiz ? ++lastQuiz.number : 1,
                  question,
                  options,
                  inline,
                  answer,
                  categories,
                  difficulty,
                  timeToStart,
                  timeToEnd,
                  hostingChannel,
                  winningChannel,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  createdBy: author.id,
                  updatedBy: author.id,
                  message: {},
                  state: 1,
            });

            const response = await newQuiz.save();
            // const response = lastQuizNumber;

            const creator = (await (await guild).members.fetch(response.createdBy)).user;

            const message = await sendMessage({
                  body: {
                        content: "@everyone",
                        embeds: [
                              {
                                    title: response.number + " No. Quiz Hosted",
                                    "color": 196083,
                                    "fields": [
                                          {
                                                "name": "**Question**",
                                                "value": question,
                                          },
                                          {
                                                "name": "**Options**",
                                                "value": options.map((option, index) => {
                                                      return `${emojis[index + 1]} ${option}`;
                                                }).join("\n"),
                                          },
                                          {
                                                "name": "**Answer**",
                                                "value": emojis[answer] + " " + options[answer - 1],
                                          },
                                          {
                                                "name": "**Categories**",
                                                "value": categories.join(", "),
                                          },
                                          {
                                                "name": "**Difficulty**",
                                                "value": difficulty,
                                          },
                                          {
                                                "name": "**The quiz will be host**",
                                                "value": `**ON: ** ${(new Date(timeToStart)).toString()}\n**AT:** <#${hostingChannel}> channel.`,
                                          },
                                          {
                                                "name": "**The result will be declared**",
                                                "value": `**ON:** ${(new Date(timeToEnd)).toString()}\n**AT:** <#${winningChannel}> channel.`
                                          },
                                          {
                                                "name": "**Created By**",
                                                "value": `<@${response.createdBy}>`,
                                          },
                                          {
                                                "name": "**Created At**",
                                                "value": (new Date(response.createdAt)).toString(),
                                          }
                                    ],
                                    "timestamp": new Date(),
                                    "author": {
                                          "name": creator.username + "#" + creator.discriminator,
                                          "icon_url": creator.avatarURL(),
                                    },
                                    "image": {},
                                    "thumbnail": {},
                                    "footer": {
                                          text: "The Quiz is created by @" + creator.username + "#" + creator.discriminator,
                                          icon_url: creator.avatarURL(),
                                    },
                              }
                        ]
                  },
                  options: {
                        channelId: process.env.QUIZ_LOG_CHANNEL_ID
                  }
            });

            newQuiz.message = message;
            await newQuiz.save();

            res.status(201).json({ status: 201, msg: response });
      } catch (err) {
            console.error(err);
            res.status(500).json({ error: err });
      }
});

Router.post("/update/:id", async (req, res) => {
      try {
            const {
                  question,
                  options,
                  inline,
                  answer,
                  categories,
                  difficulty,
                  timeToStart,
                  timeToEnd,
                  hostingChannel,
                  winningChannel,
                  author
            } = req.body;

            const isRealUser = bcrypt.compareSync(author.id, req.cookies.id);

            if (!isRealUser) {
                  return res.status(401).json({
                        status: 401,
                        error: "User doesn't have permission to manage Quizer"
                  });
            }

            const guild = client.guilds.fetch(process.env.GUILD_ID);
            const user = await (await guild).members.fetch(author.id);

            const isQuizMorderator = user._roles.includes(process.env.QUIZ_MORDERATOR_ID) || user.id === "759444802205909002";

            if (!isQuizMorderator) {
                  return res.status(401).json({
                        status: 401,
                        error: "User doesn't have permission to manage Quizer"
                  });
            }

            let response = await Quizs.findOne({ _id: req.params.id });

            if (response.state > 1) {
                  return res.send(400).json({
                        status: 400,
                        error: "Sorry, the quiz is already hosted."
                  });
            }

            response = await Quizs.findOneAndUpdate({ _id: req.params.id }, {
                  question,
                  options,
                  inline,
                  answer,
                  categories,
                  difficulty,
                  timeToStart,
                  timeToEnd,
                  hostingChannel,
                  winningChannel,
                  updatedAt: new Date(),
                  updatedBy: author.id,
            });

            const creator = (await (await guild).members.fetch(response.createdBy)).user;

            const Log_channel = await (await guild).channels.fetch(process.env.QUIZ_LOG_CHANNEL_ID);
            const prevMessage = await Log_channel.messages.fetch(response.message.data);

            const message = await prevMessage.reply({
                  content: "@everyone",
                  embeds: [
                        {
                              title: response.number + " No. Quiz Updated",
                              description: "The quiz has been updated",
                              "color": 196083,
                              "fields": [
                                    {
                                          "name": "**Question**",
                                          "value": question,
                                    },
                                    {
                                          "name": "**Options**",
                                          "value": options.map((option, index) => {
                                                return `${emojis[index + 1]} ${option}`;
                                          }).join("\n"),
                                    },
                                    {
                                          "name": "**Answer**",
                                          "value": emojis[answer] + " " + options[answer - 1],
                                    },
                                    {
                                          "name": "**Categories**",
                                          "value": categories.join(", "),
                                    },
                                    {
                                          "name": "**Difficulty**",
                                          "value": difficulty,
                                    },
                                    {
                                          "name": "**The quiz will be host**",
                                          "value": `**ON: ** ${(new Date(timeToStart)).toString()}\n**AT:** <#${hostingChannel}> channel.`,
                                    },
                                    {
                                          "name": "**The result will be declared**",
                                          "value": `**ON:** ${(new Date(timeToEnd)).toString()}\n**AT:** <#${winningChannel}> channel.`
                                    },
                                    {
                                          "name": "**Created By**",
                                          "value": `<@${response.createdBy}>`,
                                    },
                                    {
                                          "name": "**Created At**",
                                          "value": (new Date(response.createdAt)).toString(),
                                    }
                              ],
                              "timestamp": new Date(),
                              "author": {
                                    "name": creator.username + "#" + creator.discriminator,
                                    "icon_url": creator.avatarURL(),
                              },
                              "image": {},
                              "thumbnail": {},
                              "footer": {
                                    text: "The Quiz is updated by @" + author.username + "#" + author.discriminator,
                                    icon_url: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`
                              },
                        }
                  ]
            });

            res.status(200).json({ status: 200, msg: response });
      } catch (err) {
            console.error(err);
            res.status(500).json({ error: err });
      }
});

Router.post("/delete/:id", async (req, res) => {
      try {
            const isRealUser = bcrypt.compareSync(req.body.author.id, req.cookies.id);

            if (!isRealUser) {
                  return res.status(401).json({
                        status: 401,
                        error: "User doesn't have permission to manage Quizer"
                  });
            }

            const guild = client.guilds.fetch(process.env.GUILD_ID);
            const user = await (await guild).members.fetch(req.body.author.id);

            const isQuizMorderator = user._roles.includes(process.env.QUIZ_MORDERATOR_ID) || user.id === "759444802205909002";

            if (!isQuizMorderator) {
                  return res.status(401).json({
                        status: 401,
                        error: "User doesn't have permission to manage Quizer"
                  });
            }

            const response = await Quizs.findOne({ _id: req.params.id });

            if (response.state > 1) {
                  return res.send(400).json({
                        status: 400,
                        error: "Sorry, the quiz is already hosted."
                  });
            }

            
            const creator = (await (await guild).members.fetch(response.createdBy)).user;
            
            const Log_channel = await (await guild).channels.fetch(process.env.QUIZ_LOG_CHANNEL_ID);
            const prevMessage = await Log_channel.messages.fetch(response.message.data);
            
            await Quizs.findOneAndDelete({ _id: req.params.id });

            const message = await prevMessage.reply({
                  content: "@everyone",
                  embeds: [
                        {
                              title: response.number + " No. Quiz Deleted",
                              description: "The quiz has been deleted",
                              "color": 196083,
                              "timestamp": new Date(),
                              "author": {
                                    "name": creator.username + "#" + creator.discriminator,
                                    "icon_url": creator.avatarURL(),
                              },
                              "footer": {
                                    text: "The Quiz is updated by @" + req.body.author.username + "#" + req.body.author.discriminator,
                                    icon_url: `https://cdn.discordapp.com/avatars/${req.body.author.id}/${req.body.author.avatar}.png`
                              },
                        }
                  ]
            });

            res.status(200).json({ status: 200, msg: response });
      } catch (err) {
            console.error(err);
            res.status(500).json({ error: err });
      }
});

Router.post("/getAllQuizes", async (req, res) => {
      try {

            const { author } = req.body;

            const isRealUser = bcrypt.compareSync(author.id, req.cookies.id);

            if (!isRealUser) {
                  return res.status(401).json({
                        status: 401,
                        error: "User doesn't have permission to manage Quizer"
                  });
            }

            const guild = client.guilds.fetch(process.env.GUILD_ID);
            const user = await (await guild).members.fetch(author.id);

            const isQuizMorderator = user._roles.includes(process.env.QUIZ_MORDERATOR_ID) || user.id === "759444802205909002";

            if (!isQuizMorderator) {
                  return res.status(401).json({
                        status: 401,
                        error: "User doesn't have permission to manage Quizer"
                  });
            }

            var response = await Quizs.find();

            response = await Promise.all(response.map(async quiz => {
                  var createdBy = (await (await guild).members.fetch(quiz.createdBy)).user;
                  var updatedBy = (await (await guild).members.fetch(quiz.updatedBy)).user;
                  var hostingChannel = await (await guild).channels.fetch(quiz.hostingChannel);
                  var winningChannel = await (await guild).channels.fetch(quiz.winningChannel);

                  hostingChannel = {
                        id: hostingChannel.id,
                        name: hostingChannel.name,
                  }
                  winningChannel = {
                        id: winningChannel.id,
                        name: winningChannel.name,
                  }

                  var returnVal = {
                        ...quiz._doc,
                        createdBy,
                        updatedBy,
                        hostingChannel,
                        winningChannel,
                  }
                  // console.log(returnVal);

                  return returnVal;
            }));

            res.status(200).json({ status: 200, quizes: response });

      } catch (err) {
            console.error(err);
            res.status(500).json({ error: err });
      }
});


const askQuestion = async () => {
      try {
            const query = {
                  timeToStart: {
                        $lte: Date.now(),
                  },
                  state: 1
            };
            const results = await Quizs.find(query);

            const guild = client.guilds.fetch(process.env.GUILD_ID);

            for (const post of results) {

                  const creator = (await (await guild).members.fetch(post.createdBy)).user;

                  const message = await sendMessage({
                        body: {
                              content: "@everyone",
                              embeds: [
                                    {
                                          title: "Quiz #" + post.number,
                                          description: "`Question:` " + post.question,
                                          "color": 196083,
                                          "fields": post.options.map((option, index) => {
                                                return {
                                                      name: "OPTION " + emojis[index + 1],
                                                      value: option,
                                                      inline: post.inline
                                                }
                                          }),
                                          "timestamp": new Date(),
                                          "author": {
                                                "name": creator.username + "#" + creator.discriminator,
                                                "icon_url": creator.avatarURL(),
                                          },
                                          "image": {},
                                          "thumbnail": {},
                                          "footer": {
                                                text: "𝗥𝗮𝗻𝗱𝗼𝗺 𝗼𝗻𝗲 𝘄𝗵𝗼 𝘄𝗶𝗹𝗹 𝗮𝗻𝘀𝘄𝗲𝗿 𝘁𝗵𝗲 𝗰𝗼𝗿𝗿𝗲𝗰𝘁 𝗼𝗽𝘁𝗶𝗼𝗻, 𝘄𝗶𝗹𝗹 𝘄𝗶𝗻 𝘁𝗵𝗲 𝗾𝘂𝗶𝘇. 𝗔𝗻𝗱 𝗵𝗲 𝘄𝗶𝗹𝗹 𝗯𝗲 𝗴𝗶𝘃𝗲𝗻 the reward.\nThe Quiz is created by @" + creator.username + "#" + creator.discriminator,
                                                icon_url: creator.avatarURL(),
                                          },
                                    }
                              ]
                        },
                        options: {
                              channelId: post.hostingChannel,
                              reactions: post.options.map((option, index) => {
                                    return emojis[index + 1]
                              })
                        }
                  });

                  await Quizs.findOneAndUpdate({ _id: post._id }, { $set: { message: message, state: 2 } });

            }
            setTimeout(askQuestion, 1000 * 10);
      } catch (err) {
            console.error(err);
      }
}


const getWinner = async (post) => {

      var entries = [];
      for (let i = 0; i < post.options.length; i++) {
            entries.push((await getReactedUsers({
                  options: {
                        channelId: post.hostingChannel,
                        msgId: post.message.data,
                        emoji: emojis[i + 1],
                  }
            })).data)
      }
      
      let uniqueList = [ ...entries[post.answer - 1] ];
      
      for (let i = 0; i < entries.length; i++) {
            if (i == post.answer - 1) continue;
            for (let j = 0; j < entries[i].length; j++) {
                  if (uniqueList.includes(entries[i][j])) {
                        uniqueList.splice(uniqueList.indexOf(entries[i][j]), 1);
                  }
            }
      }

      const winner = uniqueList[Math.floor(Math.random() * uniqueList.length)];
      return winner;
}

const declareWinner = async () => {
      try {
            const query = {
                  timeToEnd: {
                        $lte: Date.now(),
                  },
                  state: 2
            };
            const results = await Quizs.find(query);

            const guild = client.guilds.fetch(process.env.GUILD_ID);

            for (const post of results) {

                  const creator = (await (await guild).members.fetch(post.createdBy)).user;

                  const winner = await getWinner(post);

                  const message = await sendMessage({
                        body: {
                              content: "@everyone",
                              embeds: [
                                    {
                                          title: "Result of Quiz #" + post.number,
                                          description: winner ? `<@${winner}> is the winner of the Quiz #${post.number}. Congratulations 🎉, you are gonna recieve your reward.` : "Nobody is the winner of the Quiz #" + post.number,
                                          "color": 196083,
                                          "fields": [
                                                {
                                                      name: "Correct Option",
                                                      value: "OPTION " + emojis[post.answer] + " " + post.options[post.answer - 1]
                                                }
                                          ],
                                          "timestamp": new Date(),
                                          "author": {
                                                "name": creator.username + "#" + creator.discriminator,
                                                "icon_url": creator.avatarURL(),
                                          },
                                          "image": {},
                                          "thumbnail": {},
                                          "footer": {
                                                text: "The Quiz is created by @" + creator.username + "#" + creator.discriminator,
                                                icon_url: creator.avatarURL(),
                                          },
                                    }
                              ]
                        },
                        options: {
                              channelId: post.winningChannel,
                        }
                  });

                  post.state = 3;
                  await post.save();
            }

            // await quizSchema.deleteMany(query)

            setTimeout(declareWinner, 1000 * 10);
      } catch (err) {
            console.error(chalk.red(">>===> declareWinner() \n"), err);
            return {
                  type: "error",
                  msg: err
            };
      }
}

askQuestion();
declareWinner();


module.exports = Router;