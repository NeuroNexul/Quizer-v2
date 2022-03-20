/**
 * @file - bot.js
 * @author - CodeWithArif
 * @description - Main file for the bot
 * @version - 1.0.0
 * @license - MIT (https://opensource.org/licenses/MIT), see LICENSE.md
 */

/**
 * Import necessary modules.
 */
const discord = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const chalk = require("chalk");

const { Intents } = discord;

/**
 * Create a new instance of the discord client.
 */
const client = new discord.Client(
      {
            intents: [
                  Intents.FLAGS.GUILDS,
                  Intents.FLAGS.GUILD_MEMBERS,
                  Intents.FLAGS.GUILD_BANS,
                  // Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                  Intents.FLAGS.GUILD_INTEGRATIONS,
                  // Intents.FLAGS.GUILD_WEBHOOKS,
                  // Intents.FLAGS.GUILD_INVITES,
                  // Intents.FLAGS.GUILD_VOICE_STATES,
                  // Intents.FLAGS.GUILD_PRESENCES,
                  Intents.FLAGS.GUILD_MESSAGES,
                  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                  Intents.FLAGS.GUILD_MESSAGE_TYPING,
                  // Intents.FLAGS.DIRECT_MESSAGES,
                  // Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                  // Intents.FLAGS.DIRECT_MESSAGE_TYPING,
                  // Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
            ],
            partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
      }
);

/**
 * create a password generator.
 */
var chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var passwordLength = 32;
var password = "";
var passTimeOut;
const generateNewPass = () => {
      var pass = "";
      for (var i = 0; i <= passwordLength; i++) {
            var randomNumber = Math.floor(Math.random() * chars.length);
            pass += chars.substring(randomNumber, randomNumber + 1);
      }
      password = pass;
      process.env.QuizPassword = pass;
      if (passTimeOut) clearTimeout(passTimeOut);
      passTimeOut = setTimeout(generateNewPass, 1000 * 60 * 2);
}
generateNewPass();


const sendMessage = async ({ body, options }) => {
      try {
            if (!body || !options) throw new Error("Provide Options and Body of the message");

            // if (!options.password || options.password !== process.env.QuizPassword) {
            //       return {
            //             type: "error",
            //             msg: "Password mismatch",
            //       }
            // }

            const channel = await client.channels.fetch(options.channelId);
            const message = await channel.send(body);

            if (Array.isArray(options.reactions)) {
                  await addReactions(message, options.reactions)
            }

            return {
                  type: "success",
                  msg: "Message sent successfully",
                  data: message
            }

      } catch (err) {
            console.error(chalk.red(">>===> sendMessage() \n"), err);
            return {
                  type: "error",
                  msg: err
            };
      }
}

const editMessage = async ({ body, options }) => {
      try {
            if (!body || !options) throw new Error("Provide Options and Body of the message");

            // if (!options.password || options.password !== process.env.QuizPassword) {
            //       return {
            //             type: "error",
            //             msg: "Password mismatch",
            //       }
            // }

            const channel = await client.channels.fetch(options.channelId);
            const msg = await channel.messages.fetch(options.msgId);

            // const message = await channel.send(body);
            const message = await msg.edit(body);

            if (Array.isArray(options.reactions)) {
                  await addReactions(message, options.reactions)
            }
            return {
                  type: "success",
                  msg: "Message edited successfully",
                  data: message
            }

      } catch (err) {
            console.error(chalk.red(">>===> editMessage() \n"), err);
            return {
                  type: "error",
                  msg: err
            };
      }
}

const addReactions = async (message, reactions) => {
      try {
            message.react(reactions[0])
            reactions.shift()
            if (reactions.length > 0) {
                  setTimeout(async () => await addReactions(message, reactions), 750)
            }
      } catch (err) {
            console.error(chalk.red(">>===> addReactions() \n"), err);
            return {
                  type: "error",
                  msg: err
            };
      }
}

const getReactedUsers = async ({ options }) => {
      try {

            const { channelId, msgId, emoji } = options;
            let cacheChannel = await client.channels.fetch(channelId);
            if (cacheChannel) {
                  //const msg = await channel.messages.fetch(msgId);
                  const reactionMessage = await cacheChannel.messages.fetch(msgId);
                  // console.log(reactionMessage)
                  const userList = await reactionMessage.reactions.resolve(emoji).users.fetch();
                  return {
                        type: "success",
                        msg: "Reaction Fetched successfully",
                        data: userList.map((user) => user.id).filter((id) => id !== reactionMessage.author.id)
                  }
            }
      } catch (err) {
            console.error(chalk.red(">>===> getReactedUsers() \n"), err);
            return {
                  type: "error",
                  msg: err
            };
      }
}







function startBot() {
      console.log(chalk.green(">>===> Quizer is starting..."));
      client.login(process.env.DISCORD_TOKEN).then(() => {
            console.log(chalk.greenBright(">>===> Quizer is started...\n"));
            client.user.setPresence({
                  activities: [{
                        name: "Brave Programmer",
                        type: "WATCHING"
                  }],
                  status: "online"
            })
      });
}


module.exports = {
      startBot,
      client,
      sendMessage,
      editMessage,
      getReactedUsers
}
