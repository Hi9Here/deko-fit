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
// Dialogflow


const serviceAccount = require("./config/firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://serene-bot.firebaseio.com"
});

const dbstore = admin.firestore();
const dbreal = admin.database();

// Constants for list and carousel selection
const SELECTION_KEY_SHOULDER_PRESS = 'shoulder press';
const SELECTION_KEY_BOX_SQUAT = 'box squats';
const SELECTION_CHEST_PRESS = 'chest press';
const SELECTION_AB_CRUNCHES = 'ab crunches';

// Constants for selected item responses
const SELECTED_ITEM_RESPONSES = {
  [SELECTION_KEY_SHOULDER_PRESS]: 'You selected the Shoulder Press!',
  [SELECTION_AB_CRUNCHES]: 'You selected Ab Crunches!',
  [SELECTION_KEY_BOX_SQUAT]: 'You selected the Box Squat!',
  [SELECTION_CHEST_PRESS]: 'You selected the Chest Press!'
};

const intentSuggestions = [
  'List',
  'Card'
];

const app = dialogflow({
  debug: true
    // clientId: "1063110295002-fvrho9bj92nhovma5jb5e8jt7st2giu3.apps.googleusercontent.com"
});

// app.intent('Default Welcome Intent', conv => {
//   conv.ask(new SignIn('To get your account details'))
// })

app.intent('Default Welcome Intent', (conv) => {
  conv.ask('V51')
})

// // Create a Dialogflow intent with the `actions_intent_SIGN_IN` event
// app.intent('Get Signin', (conv, params, signin) => {
//   if (signin.status === 'OK') {
//     const payload = conv.user.profile.payload
//     conv.ask(`I got your account details, ${payload.name}. What do you want to do next?`)
//   } else {
//     conv.ask(`I won't be able to save your data, but what do you want to do next?`)
//   }
// })

// Start tell-me intent
app.intent('tell-me', (conv, { exerciseTitle }) => {

  if (!exerciseTitle.exist) {
    return dbstore.collection('exercises').doc(exerciseTitle).get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such exercise!');
        } else {
          const exerciseShort = doc.data().short;
          const exerciseTit = doc.data().title;
          const exerciseAudioURL = doc.data().audio;
          const exerciseCardimgURL = doc.data().img;
          console.log(exerciseTitle);
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
        console.log('Error getting audio', err);
      });

  } else {
    console.log(`User was blank`);
  }

});
// End tell-me intent

// Start show-me intent
app.intent('show-me', (conv, { exerciseTitle }) => {

  if (!exerciseTitle.exist) {
    return dbstore.collection('exercises').doc(exerciseTitle).get()
      .then(doc => {
        if (!doc.exists) {
          console.log('No such exercise!');
        } else {
          const exerciseShort = doc.data().short;
          const exerciseTit = doc.data().title;
          const exerciseAudioURL = doc.data().audio;
          const exerciseCardimgURL = doc.data().img;
          // const exercisevideoURL = doc.data().video;
          console.log(exerciseTitle);
          conv.ask(new SimpleResponse({
            speech: `Here you go!`,
            text: `Here you go!`
          }));
          conv.ask(new BasicCard({
            text: `${exerciseShort}`,
            title: `${exerciseTit}`,
            image: new Image({
              url: exerciseCardimgURL,
              alt: exerciseTitle
            })
          }));
          conv.ask(new SimpleResponse({
            speech: 'Do you want to favorite this, hear the audio version or finish',
            text: '',
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
    console.log(`User was blank`);
  }
});
// End show-me intent

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
        description: 'High reps work really well for this exercise.',
        image: new Image({
          url: `https://storage.googleapis.com/serene-bot.appspot.com/images/ab-crunches.jpg`,
          alt: 'Ab Crunch Image',
        }),
      },
      // Add the second item to the list
      [SELECTION_KEY_BOX_SQUAT]: {
        synonyms: [
          'barbell squat exercise'
        ],
        title: 'Barbell Box Squat',
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
        description: 'This is a description of a Chest Press',
        image: new Image({
          url: `https://storage.googleapis.com/serene-bot.appspot.com/images/chest-press.jpg`,
          alt: 'Chest Press Image',
        }),
      },
      // Add the last item to the list
      [SELECTION_KEY_SHOULDER_PRESS]: {
        title: 'Shoulder Press',
        synonyms: [
          'Shouder Press',
          'Military Press'
        ],
        description: 'This is a description of a Military Press',
        image: new Image({
          url: `https://storage.googleapis.com/serene-bot.appspot.com/images/chest-press.jpg`,
          alt: 'Should Press Image',
        }),
      },
    },
  }));
});

// // Handle a media status event
// app.intent('media status', (conv) => {
//   const mediaStatus = conv.arguments.get('MEDIA_STATUS');
//   let response = 'Unknown media status received.';
//   if (mediaStatus && mediaStatus.status === 'FINISHED') {
//     response = 'I hope that helped please feel free to ask about any other exercise or piece of equipment!';
//   }
//   conv.ask(response);
//   // conv.ask(new Suggestions(intentSuggestions));
// });

app.intent('media status', (conv) => {
  const mediaStatus = conv.arguments.get('MEDIA_STATUS');
  let response = 'Unknown media status received.';
  if (mediaStatus && mediaStatus.status === 'FINISHED') {
    response = 'I hope that helped please feel free to ask about any other exercise or piece of equipment!';
  }
  conv.ask(response);
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

exports.serenefunctions = functions.https.onRequest(app);