/**
 * @file - main.js
 * @author - CodeWithArif
 * @description - Main file for the application
 * @version - 1.0.0
 * @license - MIT (https://opensource.org/licenses/MIT), see LICENSE.md
 */
console.clear();
/**
 * Prevent the application from forcefully closing
 */
process.on('uncaughtException', (err, origin) => {
      console.log(chalk.redBright(">>===> An unexpected error occured: "), err);
});
/**
 * @process - configure teh local environment variables.
 */
require('dotenv').config();

/**
 * Import necessary modules.
 */
const chalk = require('chalk');
const fetch = require('node-fetch');
const path = require('path');
/**
 * Connect to the database.
 */
require('./db/conn');
/**
 * create a new instance of the express application.
 */
const express = require('express');
const app = express();
const http = require("http");
const server = http.createServer(app);

/**
 * @process - configure the application to use all the middleware.
 */
app.use(require("body-parser").json());
app.use(require("cookie-parser")());
app.use(require("cors")());


app.use("/api/quiz", require("./modules/quiz"));
app.use("/api/auth", require("./modules/auth"));

app.use(express.static(path.join(__dirname, 'public', 'build')));
app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "public", 'build', "index.html"));
});









/**
 * Start the server.
 */
server.listen(process.env.PORT || 5000, (err) => {
      if (err) {
            console.log(chalk.red(err));
            return;
      }
      console.log(chalk.green(`\n>>===> Server is started on port ${process.env.PORT || 5000}\n`));
      require("./modules/bot").startBot();
});

