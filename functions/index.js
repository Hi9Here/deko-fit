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
  Permission
} = require('actions-on-google');
const functions = require('firebase-functions');
const admin = require("firebase-admin");

// Dialogflow
const serviceAccount = require("./config/firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://serene-bot.firebaseio.com"
});

const dbstore = admin.firestore();
let exercise = 'conv.user.storage.exercise'

const bot = dialogflow({
  debug: true
});

bot.intent('Default Welcome Intent', (conv) => {
  conv.ask('V76')
})

// Start audio intent
bot.intent('audio', (conv, { exerciseTitle }) => {
  if (exercise !== exerciseTitle) {
    let exercise = exerciseTitle;
    console.log(`exercise storage variable is ${exercise}`);
    return dbstore.collection('exercises').doc(exercise).get()
      .then(audioDoc => {
        if (!audioDoc.exists) {
          console.log('No such exercise in the database!');
        } else {
          const exerciseShort = audioDoc.data().short;
          const exerciseTit = audioDoc.data().title;
          const exerciseAudioURL = audioDoc.data().audio;
          const exerciseCardimgURL = audioDoc.data().img;
          console.log(`${exercise} is exercise`);
          conv.ask(new SimpleResponse({
            speech: `Here you go!`,
            text: `Here you go!`
          }));
          conv.ask(new MediaObject({
            name: exerciseTit,
            url: exerciseAudioURL,
            description: `Enjoy ${exerciseShort}`,
            icon: new Image({
              url: exerciseCardimgURL,
              alt: exerciseTit
            })
          }));
          conv.ask(new Suggestions([`Show`, `Favorite`, `Finish`]));
          return
        }
        return
      })
      .catch(err => {
        console.log('exerciseTitle does not exist error', err);
      });
  } else {
    console.log(`something weird happened in audio`);
  }
});
// End audio intent

// Start show intent
bot.intent('show', (conv, { exerciseTitle }) => {
  if (exercise !== exerciseTitle) {
    let exercise = exerciseTitle;
    return dbstore.collection('exercises').doc(exercise).get()
      .then(showDoc => {
        if (!showDoc.exists) {
          console.log('No such exercise in the database!');
        } else {
          const exerciseShort = showDoc.data().short;
          const exerciseTit = showDoc.data().title;
          const exerciseAudioURL = showDoc.data().audio;
          const exerciseCardimgURL = showDoc.data().img;
          conv.ask(new SimpleResponse({
            speech: `Here you go!`,
            text: `Here you go!`
          }));
          conv.ask(new BasicCard({
            text: `${exerciseShort}`,
            title: `${exerciseTit}`,
            image: new Image({
              url: exerciseCardimgURL,
              alt: exercise
            })
          }));
          conv.ask(new SimpleResponse({
            speech: 'Do you want to favorite this, hear the audio version or finish?',
            text: 'Do you want to favorite this, hear the audio version or finish?',
          }));
          conv.ask(new Suggestions([`Audio`, `Favorite`, `Finish`]));
          return
        }
        return
      })
      .catch(err => {
        console.log('Error getting card', err);
      });

  } else {
    console.log(`something weird happened in show`);
  }
});
// End show intent


bot.intent('media status', (conv) => {
  const mediaStatus = conv.arguments.get('MEDIA_STATUS');
  let response = 'Unknown media status received.';
  if (mediaStatus && mediaStatus.status === 'FINISHED') {
    response = 'I hope that helped please feel free to ask about any other exercise or piece of equipment!';
  }
  conv.ask(response);
});

exports.dekofit = functions.https.onRequest(bot);