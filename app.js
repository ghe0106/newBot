//requirements
let restify = require('restify'),
    builder = require('botbuilder');

//set up restify server
let server = restify.createServer();
server.listen(process.env.PORT || 3000, function() {
    console.log('%s listening to %s', server.name, server.url);
});

//create chat bot
let connector = new builder.ChatConnector({appId: 'de2ae130-68e5-4e92-ac44-21f1f9520e74', appPassword: 'CFEJbz5qpFhu1qDakg7KJN2'});
let bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//create bot dialogs
bot.dialog('/', function(session) {
    session.send("Hello World!");
});
