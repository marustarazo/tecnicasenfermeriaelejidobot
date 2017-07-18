
/* Select Language Intent Dialog:
    1. (locale_prompt)   Shows language options (loop until correct choice)
    2. (locale_updated)  Shows new language. Update userData.language
    (This dialog records that the user has changed his preferred language (language=***))
*/

var builder = require('botbuilder');

//=========================================================
// Library creation
//=========================================================

var lib = new builder.Library('selectLanguage_intent');

exports.createLibrary = function () {
    return lib;
}

//=========================================================
// Select Language Dialog
//=========================================================

exports.selectLanguageIntentDialog = function (session, languages) {
    // Start dialog in library namespace
    session.beginDialog('selectLanguage_intent:selectLanguageIntentDialog', languages);
}

lib.dialog('selectLanguageIntentDialog', [
    function (session, languages) {  // STEP 1
        builder.Prompts.choice(session, 'locale_prompt', languages);
    },
    function (session, results) {  // STEP 2
        var locale;
        switch (results.response.entity) {
            case 'English':
                locale = 'en';
                break;
            case 'Español':
                locale = 'es';
                break;
        }
        session.preferredLocale(locale, function (err) {
            if (!err) {
                session.userData.language = results.response.entity;
                session.endDialog('locale_updated');
            } else {
                session.error(err);
            }
        });
    }
]);
