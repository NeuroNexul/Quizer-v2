const mongoose = require('mongoose')

const reqString = {
      type: String,
      required: true,
}
const reqObject = {
      type: Object,
      required: true,
}
const reqBool = {
      type: Boolean,
      required: true,
}
const reqNumber = {
      type: Number,
      required: true,
}
const reqDate = {
      type: Date,
      required: true,
}
const reqArray = {
      type: Array,
      required: true,
}


const quizSchema = new mongoose.Schema({
      number: reqNumber,
      question: reqString,
      options: reqArray,
      inline: reqBool,
      answer: reqNumber,
      categories: reqArray,
      difficulty: reqString,
      timeToStart: reqDate,
      timeToEnd: reqDate,
      hostingChannel: reqString,
      winningChannel: reqString,
      createdAt: reqDate,
      updatedAt: reqDate,
      createdBy: reqObject,
      updatedBy: reqObject,
      message: reqObject,
      state: reqNumber,
});






const name = 'Quizs'

module.exports = mongoose.model[name] || mongoose.model(name, quizSchema, name);