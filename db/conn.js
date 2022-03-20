const mongoose = require('mongoose')
const chalk = require("chalk");

const db = mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
}).then(() => {
      console.log(chalk.green('>>===> Database connection successful'))
}).catch(err => {
      console.error(chalk.red('>>===> Database connection error: '), err);
})