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
    appId: 'a986a103-1366-44cc-8f92-7e2d066081b0',
    appPassword: 'YDQ9cLT6omhjQK4pRQDizEd'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        // call custom prompt
        session.beginDialog('/meaningOfLife', {
            prompt: "What's the meaning of life?", 
            retryPrompt: "Sorry that's incorrect. Guess again."
        });
    },
    function (session, results) {
        // Check their answer
        if (results.response) {
            session.send("That's correct! The meaning of life is 42.");
        } else {
            session.send("Sorry you couldn't figure it out. Everyone knows that the meaning of life is 42.");
        }
    }
]);

bot.dialog('/meaningOfLife', builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
    return response === '42';
}));
