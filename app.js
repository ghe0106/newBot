var builder = require('botbuilder');
var restify = require('restify');
var https = require('https');
var getQuote = require('./QuoteEngine');

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

// console testing? uncomment the next line and comment out the server.post line below
//connector = new builder.ConsoleConnector().listen();

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

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=c413b2ef-382c-45bd-8ff0-f76d60e2a821&subscription-key=6d0966209c6e4f6b835ce34492f3e6d9&q=';
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
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
        session.send("If you like, you can try changing some of your choices and I'll recalculate how much you would get.");
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
      builder.Prompts.text(session, 'What percentage of this would you like to take out straight away?');
    },
    function (session, results, next) {
      session.userData.lumpSumPcg = results.response;
      next();
    },
    function (session, results, next) {
      builder.Prompts.choice(session, 'Would you like to use the remaining money to buy a guaranteed income for life, or would you prefer more control over the amount of income and how long it lasts?',
        ['guaranteed', 'flexible']);
    },
    function (session, results, next) {
      session.userData.choice = results.response.entity;
      // Call service
      getQuote(session.userData.choice, session.userData.age, session.userData.pensionPot, session.userData.lumpSumPcg, function(error, response) {
        session.send("So you're %s and have £%s in your fund, of which you'd like to take %s percent straight away, and use the remaining amount to buy a %s income.",
          session.userData.age, session.userData.pensionPot, session.userData.lumpSumPcg, session.userData.choice);
        session.send('Based on your answers, you could get an income of £%f per year (£%f after tax).', response.grossIncome, response.netIncome);
        if (response.cashAmount > 0) {
          if (response.cashTax > 0) {
            session.send('This is based on taking £%f as a lump sum (£%f after tax) and using the rest to buy a %s income.',
              response.cashAmount, (response.cashAmount - response.cashTax), session.userData.choice);
          } else {
            session.send('This is based on taking £%f as a lump sum and using the rest to buy a %s income.',
              response.cashAmount, session.userData.choice);
          }
        }
        session.userData.lastQuote = response;
        session.endDialogWithResult(results);
      });
    }
]);
