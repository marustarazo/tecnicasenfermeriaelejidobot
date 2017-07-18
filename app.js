
/* Running the chatbot: node app.js
    Code blocks:
        1. Import libraries
        2. Create bot: connection, locale, recognizer and add libraries
        3. Start listening and detecting intents
    Before running, please check these environment variables:
        HTTPS_PROXY: comment if running outside VF VPN
        PORT: 3978 is the default port when using MS Bot Framework Emulator
        EMULATOR: "YES" if using MS Bot Framework Emulator, "NO" if using console
        LUIS_MODEL_URL: URL from trained LUIS application, includes subscription-key from Azure)
*/

//=========================================================
// Libraries
//=========================================================

// This loads the environment variables from the .env file
require('dotenv').load();

var builder = require('botbuilder');
var restify = require('restify');

// Other modules: all dialogs
var selectLanguage_intent = require('./intents/selectLanguage_intent.js');
var search_intent = require('./intents/search_intent.js');

//=========================================================
// Define Bot
//=========================================================

if (process.env.EMULATOR == 'YES') {  // Option 1: MS Bot Emulator ---------
    // Setup Restify Server
    var server = restify.createServer();
    server.listen(process.env.PORT, function () {
        console.log('%s listening to %s', server.name, server.url);
    });

    var connector = new builder.ChatConnector({
        appId: process.env.MICROSOFT_APP_ID == "" ? null:process.env.MICROSOFT_APP_ID,
        appPassword: process.env.MICROSOFT_APP_PASSWORD == "" ? null:process.env.MICROSOFT_APP_PASSWORD
    });
    
    server.post('/api/messages', connector.listen());
}
else {  // Option 2: Console ---------
    var connector = new builder.ConsoleConnector().listen();
}

// Create chat bot
var bot = new builder.UniversalBot(connector, function (session) {
    // Simply defer to help dialog for un-recognized intents
    if ( typeof session.message.text !== 'undefined' && session.message.text ) {
        session.userData.notfoundquery = session.message.text;
        session.endDialog('intentnotfound');
    } else {
        session.endDialog('intentnotfound_no_message');
    }
});

// Configure bots default language and locale folder path.
bot.set('localizerSettings', {
    botLocalePath: "./customLocale", 
    defaultLocale: process.env.DEFAULT_LANGUAGE
});

// Add global recognizer for LUIS model (run for every message)
bot.recognizer(new builder.LuisRecognizer(process.env.LUIS_MODEL_URL));

// Add user defined libraries to bot
bot.library(selectLanguage_intent.createLibrary());
bot.library(search_intent.createLibrary());

//=========================================================
// LISTENING AND DETECTING INTENTS
//=========================================================

//=========================================================
// Dialogs without requirements

bot.dialog('/selectLanguageDialog', [
    function (session, args) {
        selectLanguage_intent.selectLanguageIntentDialog(session, process.env.LANGUAGES.split(' '));
    }
]).triggerAction({ matches: 'SelectLanguage' });


//=========================================================
// Dialogs with requirements
// (Dialogs that can only be launched if user has already entered in other intents)
// Add dialog to return list of shirts available
bot.dialog('showBingResults', [
    function (session, args) {
        search_intent.searchIntentDialog(session);
    }
]).triggerAction({ matches: /^(buscar|search)/i });

//=========================================================
// One-line dialogs

bot.dialog('/greetingDialog', [
    function (session) {
        // Check if we have answer with hello to ask the user about his/her intentions
        if (!session.userData.previous_hello) {
            session.userData.previous_hello = true
            session.endDialog('hello');
        } else {
            session.endDialog('help');
        }
    }
]).triggerAction({ matches: 'Greeting' });


bot.dialog('/endConversationDialog', [
    function (session) {
        session.endDialog('bye');
        session.userData.previous_hello = false
    }
]).triggerAction({ matches: 'EndConversation' });


bot.dialog('/Thanking', [
    function (session, args, next) {
        session.endDialog('thanking');
    }
]).triggerAction({ matches: 'Thanking' });

// For the generic intent we have added all of them to spanish index.json
// we are going to open that file and check all data finished with _intent_answer
var fs = require('fs');
var allIntents = JSON.parse(fs.readFileSync('customLocale/es/index.json', 'utf8'));

listIntents = []
if (allIntents) {
    //console.log(allIntents)
    for(var myKey in allIntents) {
        if (myKey.endsWith("_intent_answer")) {
            listIntents.push(myKey.replace('_intent_answer',''));
            console.log("Intent added: " + myKey.replace('_intent_answer','') + ", value:" + allIntents[myKey]);
        }
    }
}

if (listIntents.length < 1) {
    listIntents = [
        "alimentos-liquidos",
        "alimentos-frutas-verduras",
        "alimentos-edulcorantes",
        "alimentos-lactancia-materna",
        "alimentos-lactancia-artificial",
        "alimentos-bebe",
        "alimentos-conservar-leche-materna",
        "alimentos-margarina",
        "aparato-digestivo-ayuno",
        "aparato-digestivo-bolo",
        "aparato-digestivo-celulas-alfa",
        "aparato-digestivo-funciones",
        "aparato-digestivo-organos",
        "aparato-digestivo-estomago",
        "aparato-digestivo-factor-intrinseco",
        "aparato-digestivo-flexura",
        "aparato-digestivo-heces",
        "aparato-digestivo-hilo-hepatico",
        "aparato-digestivo-ileocecal",
        "aparato-digestivo-microvellosidades",
        "aparato-digestivo-pancreas",
        "aparato-digestivo-vesicula-higado",
        "dieta-equilibrada-suplementos",
        "dieta-equilibrada-proteinas",
        "dieta-equilibrada-sobrepeso",
        "dieta-equilibrada-general",
        "dieta-equilibrada-hipercolesterolemia",
        "dietoterapia-anorexia",
        "dietoterapia-recomendacion",
        "dietoterapia-astringente",
        "dietoterapia-basal",
        "dietoterapia-progresiva",
        "metabolismo-anemia",
        "metabolismo-catabolismo-anabolismo",
        "enfermedad-peritoneal",
        "metabolismo-ictericia",
        "metabolismo-litiasis-biliar",
        "nutrientes-colesterol",
        "nutrientes-principios-inmediatos"]
}

//console.log(listIntents)
bot.dialog('/IntentAnswer', [
    function (session, args, next) {
        session.endDialog(args.intent.intent + "_intent_answer");
    }
]).triggerAction({ matches: listIntents });
