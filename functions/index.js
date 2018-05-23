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
  conv.ask('V83')
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
      .then(doc => {
        if (!doc.exists) {
          console.log('No such exercise in the database!');
        } else {
          const exerciseShort = doc.data().short;
          const exerciseTit = doc.data().title;
          const exerciseAudioURL = doc.data().audio;
          const exerciseCardimgURL = doc.data().img;
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

// Start profile measurements
bot.intent('profile', (conv, { Userweight, Userheight }) => {
  if (!Userweight.exist || Userheight.exist) {
    return dbstore.collection('profile').doc('profileID').collection('details').doc('measurements').set({
        weight: Userweight,
        height: Userheight
      })
      .then(function() {
        console.log("Document successfully written!");
        return
      })
      .catch(function(error) {
        console.error("Error writing document: ", error);
        return
      });
  } else {
    console.log(`something weird happened in show`);
  }
});
// End profile measurements

// show profile measurements
bot.intent('showprofile', (conv) => {
  return dbstore.collection('profile').doc('profileID').collection('details').doc('measurements').get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such measure ments exist!');
        conv.ask(new SimpleResponse({
          speech: 'No such measurements exist?',
          text: 'No such measuremets exist?',
        }));
      } else {
        const heightVal = doc.data().height.amount;
        const weightVal = doc.data().weight.amount;
        const weightUnit = doc.data().weight.unit;
        const heightUnit = doc.data().height.unit;
        conv.ask(new SimpleResponse({
          speech: `Here you go!`,
          text: `Here you go!`
        }));
        conv.ask(new BasicCard({
          text: `Height is ${heightVal} ${heightUnit} and Weight is ${weightVal} ${weightUnit}`,
          title: `Terry Crews`,
          image: new Image({
            url: `https://storage.googleapis.com/serene-bot.appspot.com/images/terry-crews.jpg`,
            alt: `profile`
          })
        }));
        conv.ask(new SimpleResponse({
          speech: 'Here is your information. Would you like to change weight or height?',
          text: 'Here is your information. Would you like to change weight or height?',
        }));
        conv.ask(new Suggestions([`Change Weight`, `Change Height`]));
        return
      }
      return
    })
    .catch(err => {
      console.log('Error getting profile card', err);
    });
});
// End profile measurements


bot.intent('media status', (conv) => {
  const mediaStatus = conv.arguments.get('MEDIA_STATUS');
  let response = 'Unknown media status received.';
  if (mediaStatus && mediaStatus.status === 'FINISHED') {
    response = 'I hope that helped please feel free to ask about any other exercise or piece of equipment!';
  }
  conv.ask(response);
});

exports.serenefunctions = functions.https.onRequest(bot);