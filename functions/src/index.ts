import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const secrets = functions.config().doppler || {};

const credential = secrets.GOOGLE_CREDENTIAL_JSON;
let params;
if (credential) {
  const serviceAccount = JSON.parse(credential);
  params = {
    credential: admin.credential.cert(serviceAccount),
  };
} else {
  params = functions.config().firebase;
}

admin.initializeApp(params);
admin.firestore().settings({ignoreUndefinedProperties: true});

import {
  processSignUp,
  refreshToken,
} from "./hasura";

exports.processSignUp = processSignUp;
exports.refreshToken = refreshToken;

import {
  isFollowing,
  hasRetweeted} from "./twitter/twitter";

exports.isFollowing = isFollowing;
exports.hasRetweeted = hasRetweeted;

import {
  genTwitterOAuthProof,
} from "./verifier";

exports.genTwitterOAuthProof = genTwitterOAuthProof;

import {
  priceInfo,
} from "./config";

exports.priceInfo = priceInfo;

import {
  claimRedPacket,
} from "./redpacket";

exports.claimRedPacket = claimRedPacket;
