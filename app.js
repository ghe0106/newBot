//requirements
let restify = require('restify'),
    builder = require('botbuilder');

//set up restify server
let server = restify.createServer();
server.listen(process.env.PORT || 3000, function() {
    console.log('%s listening to %s', server.name, server.url);
});

//create chat bot
let connector = new builder.ChatConnector({appId: 'a986a103-1366-44cc-8f92-7e2d066081b0', appPassword: 'YDQ9cLT6omhjQK4pRQDizEd'});
let bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//create bot dialogs
bot.dialog('/', function(session) {
    session.send("Hello World!");
});
