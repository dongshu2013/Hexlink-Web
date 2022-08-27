import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const credential = process.env.GOOGLE_CREDENTIAL_JSON;
let params;
if (credential) {
  const serviceAccount = JSON.parse(credential);
  params = {
    credential: admin.credential.cert(serviceAccount),
  };
} else {
  params = functions.config().firebase;
}

const firebaseApp = admin.initializeApp(params);
admin.firestore().settings({ignoreUndefinedProperties: true});

export {firebaseApp};