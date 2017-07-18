
/* Select Buscar Intent Dialog:
    It is going to use Bing to search in the web
*/
require('dotenv').load();
var builder = require('botbuilder');
var Bing = require('node-bing-api')({ accKey: process.env.MICROSOFT_BING_KEY});

//=========================================================
// Library creation
//=========================================================
var lib = new builder.Library('search_intent');

exports.createLibrary = function () {
    return lib;
}

//=========================================================
// Search Dialog
//=========================================================
exports.searchIntentDialog = function (session) {
    // Start dialog in library namespace
    session.beginDialog('search_intent:searchIntentDialog');
}

lib.dialog('searchIntentDialog', [
    function (session) {  // STEP 1
        if ( typeof session.userData.language !== 'undefined' && session.userData.language ){
            console.log("User have language defined as %s", session.userData.language)
        } else {
            // Define the language to spanish
            session.userData.language = process.env.DEFAULT_LANGUAGE
        }

        if ( typeof session.userData.notfoundquery !== 'undefined' && session.userData.notfoundquery ) {
            // Search using Bing
            Bing.web(session.userData.notfoundquery, {
                top: process.env.MICROSOFT_BING_MAX_RESULTS,  // Number of results (max 50)
                skip: process.env.MICROSOFT_BING_SKIP_RESULTS,   // Skip no results
                market: session.userData.language,
                textDecorations: process.env.MICROSOFT_BING_TEXT_DECORATIONS,
                adult: process.env.MICROSOFT_BING_ADULT
            }, function(error, res, body){
                if (res.statusCode == 200 && (body.videos || body.webPages)) {
                    //console.log("**RESPONSE**");
                    //console.log(res);
                    console.log("**BODY**");
                    console.log(body);

                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                    var search_completed = false;

                    // Create attachment with the results from Bing
                    var search_results = [];
                    if ( typeof body.webPages !== 'undefined' && body.webPages &&
                    	typeof body.webPages.value !== 'undefined' && body.webPages.value ) {
                        for (var i = 0; i < body.webPages.value.length; i++) {
                            search_results[i] = new builder.HeroCard(session)
                                .title(body.webPages.value[i].name)
                                .subtitle(body.webPages.value[i].displayUrl)
                                .text(body.webPages.value[i].snippet)
                                .buttons([builder.CardAction.openUrl(session, body.webPages.value[i].url)]);
                        }
                        if (search_results.length > 0) {
                        	session.send("websearchresults");
                            session.send(session.userData.notfoundquery);
                            msg.attachments(search_results);
                            session.send(msg);
                            search_completed = true;
                        }
                    }

                    // Video results
                    var video_search_results = [];
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                    if ( typeof body.videos !== 'undefined' && body.videos &&
                        typeof body.videos.value !== 'undefined' && body.videos.value ) {
                        for (var i = 0; i < body.videos.value.length; i++) {
                            console.log(body.videos.value[i]);
                            video_search_results[i] = new builder.VideoCard(session)
                                .title(body.videos.value[i].name)
                                .subtitle(body.videos.value[i].publisher[0].name)
                                .text(body.videos.value[i].description)
                                .image(builder.CardImage.create(session, body.videos.value[i].thumbnailUrl))
                                .media([{ url: body.videos.value[i].hostPageDisplayUrl }])
                                .buttons([builder.CardAction.openUrl(session, body.videos.value[i].contentUrl)]);
                        }
                        if (video_search_results.length > 0) {
                            session.send("videosearchresults");
                            session.send(session.userData.notfoundquery);
                            msg.attachments(video_search_results);
                            session.send(msg);
                            search_completed = true;
                        }
                    }
                    session.userData.notfoundquery = null;
                    if ( search_completed ) {
                        session.endDialog("searchresultsend");
                    } else {
                        session.send("searchnotfound");
                        session.endDialog(session.userData.notfoundquery);
                    }
                } else {
                    session.send("searchnotfound");
                    session.endDialog(session.userData.notfoundquery);
                    console.log('Error searching in Bing: %s', error);
                }
            });
        } else {
            session.endDialog("intentnotfound");
        }
    }
]);
