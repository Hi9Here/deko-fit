'use strict';

const functions = require('firebase-functions');
const admin = require("firebase-admin");
const moment = require('moment');
const {
  dialogflow,
  Image,
  BasicCard,
  MediaObject,
  Suggestions,
  SimpleResponse,
  List,
  Carousel,
  SignIn
} = require('actions-on-google');

admin.initializeApp();

// Setup some variables for the paths to Firestore Database
const auth = admin.auth();
const db = admin.firestore();
let FieldValue = require('firebase-admin').firestore.FieldValue;

// Just something to stop annoying error messages, ignore
db.settings({ timestampsInSnapshots: true });

// Version and logging
const version = 0.1;

const datetime = Date.now();
const when = moment(datetime).format('MMMM Do YYYY, h:mm:ss a');
console.info(`*  Deployed  * V${version} at ${when}`)

// Create a Firebase Environmental Variable yarn envset
// firebase functions:config:set fireconfig.id="[CLIENTID]"
// firebase functions:config:get to find out what they are
const bot = dialogflow({
  clientId: functions.config().fireconfig.id,
  debug: true,
});

//Middleware get's fired everytime before intents
bot.middleware(async(conv) => {
  const { payload } = conv.user.profile
    // Get the email value from the Conversation User
  const { email } = conv.user;
  console.info(`*  middleware  * VERSION ${version}`);
  console.info(`*  middleware  * conv.user ${JSON.stringify(conv.user, null, 2)}`);
  console.info(`*  middleware  * conv.data.uid ${JSON.stringify(conv.data.uid, null, 2)}`);
  console.info(`*  middleware  * email const ${JSON.stringify(email, null, 2)}`);
  console.info(`*  middleware  * payload const ${JSON.stringify(conv.user.profile.payload, null, 2)}`);
  if (!conv.data.uid && email) {
    try {
      // If there is no uid then grab the UID from the Firebase Email Address
      conv.data.uid = (await auth.getUserByEmail(email)).uid;
      console.info(`*  middleware  * conv.data.uid. If no uid then use UID from Firebase ${JSON.stringify(conv.data.uid, null, 2)}`);
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw console.error(`*  middleware  * error is ${error}`);
      }
      // If the user is not found, create a new Firebase auth user
      // using the email obtained from the Google Assistant
      conv.data.uid = (await auth.createUser({ email })).uid;
      console.info(`*  middleware  * conv.data.uid. If user not found. Create a new Firebase auth user from the Google Profile ${JSON.stringify(conv.data.uid, null,2)}`);
    }
  }
  // Finding out if there is already a profile
  if (conv.data.uid) {
    try {
      const profile = await db.collection('entities').where(`uid`, `==`, conv.data.uid).get();
      if (profile.empty) {
        console.warn(`*  Middleware  * No matching Profile but a UID so Set Profile `);
        try {
          return db.collection('user').doc(conv.data.uid).set({
            Email: payload.email,
            LastName: payload.family_name,
            FirstName: payload.given_name,
            FullName: payload.name,
            ProfileImage: payload.picture,
            ProfileCreated: payload.iat,
            ProfileExpires: payload.exp,
            GoogleID: payload.sub
          });
        } catch (error) {
          throw console.error(`*  middleware  * error trying to Set payload data ${error}`);
        }
      }
    } catch (error) {
      console.error(`*  Diary  * Error getting diary under ${error}`);
    }
    try {
      return db.collection('user').doc(conv.data.uid).update({
        Email: payload.email,
        LastName: payload.family_name,
        FirstName: payload.given_name,
        FullName: payload.name,
        ProfileImage: payload.picture,
        ProfileCreated: payload.iat,
        ProfileExpires: payload.exp,
        GoogleID: payload.sub
      });
    } catch (error) {
      throw console.error(`*  middleware  * error trying to Update payload data ${error}`);
    }
  }
  console.info(`*  middleware  * User Payload Saved ${JSON.stringify(conv.user.profile.payload, null, 2)}`);

});
// End of Middleware

// Sign In
bot.intent("Start Sign-in", conv => {
  console.info(`*  Start Sign-in  * Intent Fired`);
  conv.ask(new SignIn("To use me"));
});
// End Sign In

exports.dekofitfunc = functions.https.onRequest(bot);