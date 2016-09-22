// Requirements
"use strict";

var builder = require('botbuilder');
var restify = require('restify');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3000, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
  appId: process.env.MSFT_APP_ID,
  appPassword: process.env.MSFT_APP_SECRET
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Web chat UI request
server.get('/', restify.serveStatic({
  directory: __dirname,
  default: '/index.html'
}));

//=========================================================
// Bots Dialogs
//=========================================================


var intents = new builder.IntentDialog();
bot.dialog('/', intents);


intents.matches(/^start again/i, [
    function (session) {
        session.beginDialog('/profile');
    }
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.age) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Based on your answers, you could get £12345 per year.');
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! I can help you explore your options at retirement. To get started, can you tell me how old you are?');
    },
    function (session, results, next) {
        session.userData.age = results.response;
        next();
    },
    function (session, results, next) {
      builder.Prompts.text(session, 'Next, could you tell me how much your pension pot is worth, in pounds?');
    },
    function (session, results, next) {
      session.userData.pensionPot = results.response;
      next();
    },
    function (session, results, next) {
      builder.Prompts.text(session, 'How much of this would you like to take out straight away, in pounds?');
    },
    function (session, results, next) {
      session.userData.lumpSum = results.response;
      next();
    },
    function (session, results, next) {
      builder.Prompts.choice(session, 'Would you like to use the remaining money to buy a guaranteed income for life, or would you prefer more control over the amount of income and how long it lasts?',
        ['guaranteed', 'flexible']);
    },
    function (session, results, next) {
      session.userData.choice = results.response.entity;
      session.send("So you're %s and have £%s in your fund, of which you'd like to take £%s straight away, and use the remaining amount to buy a %s income.",
        session.userData.age, session.userData.pensionPot, session.userData.lumpSum, session.userData.choice);
    }
]);
