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

const dbstore = admin.firestore();
const dbreal = admin.database();

// Constants for list and carousel selection
const SELECTION_KEY_BICEP_CURL = 'bicep-curl';
const SELECTION_KEY_BOX_SQUAT = 'box-squat';
const SELECTION_CHEST_PRESS = 'chest-press';
const SELECTION_AB_CRUNCHES = 'ab-crunches';

// Constants for selected item responses
const SELECTED_ITEM_RESPONSES = {
  [SELECTION_KEY_BICEP_CURL]: 'You selected the Bicep Curl!',
  [SELECTION_AB_CRUNCHES]: 'You selected Ab Crunches!',
  [SELECTION_KEY_BOX_SQUAT]: 'You selected the Box Squat!',
  [SELECTION_CHEST_PRESS]: 'You selected the Chest Press!'
};

const intentSuggestions = [
  'List',
  'Card'
];

const app = dialogflow({ debug: true });

// Pull out exercises on firestore
app.intent('tell-me', (conv, { exerciseTitle }) => {

  if (!exerciseTitle.exist) {
    return dbstore.collection('exercises').doc(exerciseTitle).get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such exercise!');
        } else {
          const exerciseShort = doc.data().short;
          const exerciseTitle = doc.data().title;
          const exerciseAudioURL = doc.data().audio;
          const exerciseCardimgURL = doc.data().img;
          console.log(exerciseTitle);
          conv.ask(new SimpleResponse({
            speech: `This is the ${exerciseTitle}`,
            text: `This is the text for the ${exerciseTitle}`,
          }));
          conv.ask(new MediaObject({
            name: exerciseTitle,
            url: exerciseAudioURL,
            description: `Enjoy ${exerciseShort}`,
            icon: new Image({
              url: exerciseCardimgURL,
              alt: exerciseTitle
            })
          }));
          conv.ask(new Suggestions(intentSuggestions));
          return
        }
        return
      })
      .catch(err => {
        console.log('Error getting document', err);
      });

  } else {
    console.log(`User was blank`);
  }

  // if (!conv.surface.capabilities.has('actions.capability.AUDIO_OUTPUT')) {
  //   conv.ask('Sorry, this device does not support audio playback.');
  //   return;
  // }
  // const exerciseDescription = exerciseTitle.toLowerCase();
  // console.log(`Exercises is ${exerciseDescription}`);

  // const imgURL = `https://storage.googleapis.com/serene-bot.appspot.com/images/${exerciseDescription}.jpg`;
  // const audioURL = `https://storage.googleapis.com/serene-bot.appspot.com/audio/${exerciseDescription}.mp3`;

  // conv.ask(new SimpleResponse({
  //   speech: `This is the ${exerciseDescription}`,
  //   text: `This is the text for the ${exerciseDescription}`,
  // }));


  // conv.ask(new MediaObject({
  //   name: `${exerciseDescription}`,
  //   url: audioURL,
  //   description: `Enjoy ${exerciseDescription}`,
  //   icon: new Image({
  //     url: imgURL,
  //     alt: `${exerciseDescription} Pic`
  //   })
  // }));
  // conv.ask(new Suggestions(intentSuggestions));
  // return
});
// Stop Pulling out exercises on firestore

// // Show card
// app.intent('show card', (conv, { exerciseTitle }) => {

//   if (!conv.surface.capabilities.has('actions.capability.AUDIO_OUTPUT')) {
//     conv.ask('Sorry, this device does not support audio playback.');
//     return;
//   }
//   const exerciseDescription = exerciseTitle.toLowerCase();
//   console.log(`Exercises is ${exerciseDescription}`);

//   const imgURL = `https://storage.googleapis.com/serene-bot.appspot.com/images/${exerciseDescription}.jpg`;
//   const audioURL = `https://storage.googleapis.com/serene-bot.appspot.com/audio/${exerciseDescription}.mp3`;

//   conv.ask(new SimpleResponse({
//     speech: `This is the ${exerciseDescription}`,
//     text: `This is the text for the ${exerciseDescription}`,
//   }));

//   conv.ask(new BasicCard({
//     text: `This is a basic card.  Text in a basic card can include "quotes" and
//     most other unicode characters including emoji 📱.  Basic cards also support
//     some markdown formatting like *emphasis* or _italics_, **strong** or
//     __bold__, and ***bold itallic*** or ___strong emphasis___ as well as other
//     things like line  \nbreaks`,
//     subtitle: 'This is a subtitle',
//     title: exerciseTitle,
//     buttons: new Button({
//       title: 'Link to the Video',
//       url: 'https://youtu.be/V2ScdGQH_60',
//     }),
//     image: new Image({
//       url: imgURL,
//       alt: 'Image alternate text',
//     }),
//   }));
//   return
// });

// List
app.intent('list', (conv) => {
  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.ask('Sorry, try this on a screen device or select the ' +
      'phone surface in the simulator.');
    return;
  }
  conv.ask(new SimpleResponse({
    speech: 'This is a list of exercises',
    text: 'Howdy! I would like to share with you some exercises?',
  }));
  // Create a list
  conv.ask(new List({
    title: 'Exercises',
    items: {
      // Add the first item to the list
      [SELECTION_AB_CRUNCHES]: {
        synonyms: [
          'crunches',
          'ab crunch'
        ],
        title: 'Ab Crunches',
        description: 'This is a description of Ab Crunches',
        image: new Image({
          url: '`https://storage.googleapis.com/serene-bot.appspot.com/images/ab-crunches.jpg`',
          alt: 'Ab Crunch Image',
        }),
      },
      // Add the second item to the list
      [SELECTION_KEY_BOX_SQUAT]: {
        synonyms: [
          'barbell squat exercise'
        ],
        title: 'barbell box squat exercise',
        description: 'This is a descriptioin of box squat',
        image: new Image({
          url: `https://storage.googleapis.com/serene-bot.appspot.com/images/box-squat.jpg`,
          alt: 'Box Squat Image',
        }),
      },
      // Add the third item to the list
      [SELECTION_CHEST_PRESS]: {
        synonyms: [
          'chest',
          'press'
        ],
        title: 'Chest Press',
        description: 'This is a descriptioin of a Chest Press',
        image: new Image({
          url: '`https://storage.googleapis.com/serene-bot.appspot.com/images/chest-press.jpg`',
          alt: 'Chest Press Image',
        }),
      },
      // Add the last item to the list
      [SELECTION_KEY_BICEP_CURL]: {
        title: 'Bicep Curl',
        synonyms: [
          'Barbell Curl',
          'Barbell Bicep Curl'
        ],
        description: 'This is a description of Bicep Curl',
        image: new Image({
          url: `https://storage.googleapis.com/serene-bot.appspot.com/images/bicep-curl.jpg`,
          alt: 'Bicep Curl Image',
        }),
      },
    },
  }));
});

// Handle a media status event
app.intent('media status', (conv) => {
  const mediaStatus = conv.arguments.get('MEDIA_STATUS');
  let response = 'Unknown media status received.';
  if (mediaStatus && mediaStatus.status === 'FINISHED') {
    response = 'Hope you enjoyed the exercise!';
  }
  conv.ask(response);
  conv.ask(new Suggestions(intentSuggestions));
});

// React to list selection
app.intent('item selected', (conv, params, option) => {
  let response = 'You did not select any item from the list';
  if (option && SELECTED_ITEM_RESPONSES.hasOwnProperty(option)) {
    response = SELECTED_ITEM_RESPONSES[option];
  } else {
    response = 'You selected an unknown exercise from the list';
  }
  conv.ask(response);
});

app.intent('Default Welcome Intent', (conv) => {
  conv.ask('V30')
})

exports.serenefunctions = functions.https.onRequest(app);