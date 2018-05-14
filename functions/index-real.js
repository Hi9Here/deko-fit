'use strict';

const {
  dialogflow,
  BrowseCarousel,
  BrowseCarouselItem,
  Button,
  Carousel,
  Image,
  List,
  BasicCard,
  MediaObject,
  Suggestions,
  SimpleResponse,
} = require('actions-on-google');
const functions = require('firebase-functions');
const admin = require("firebase-admin");

const serviceAccount = require("./config/firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://serene-bot.firebaseio.com"
});

const dbreal = admin.database();
const dbref = dbreal.ref("lifts/box-squat");
const app = dialogflow({ debug: true });

// Pull out exercises on firestore
app.intent('exercise', (conv, { exerciseTitle }) => {

  if (!exerciseTitle.exist) {
    dbref.on("value", function(snapshot) {

      const exerciseDes = snapshot.val();
      console.log(`Realtime database value is ${exerciseDes}`);
      conv.ask(new SimpleResponse({
        speech: `This is the ${exerciseDes}`,
        text: `This is the text for the ${exerciseDes}`,
      }));
      return
    }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  }

});

app.intent('Default Welcome Intent', (conv) => {
  conv.ask('Vreal3')
})

exports.serenefunctions = functions.https.onRequest(app);