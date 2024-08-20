'use strict';

const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const Register = require('./register');
const Transfer = require('./transfer');
const Flex = require('./flexMessage');

var LINE_SDK = function (user) {
  this.created_at = new Date();
};

LINE_SDK.Webhook = function (req) {
  return new Promise(async (resolve, reject) => {
    try {
      const events = req.body.events;
      // console.log('events: ', events)

      if (!events) {
        console.error("No events found in the request body.");
        return reject(new Error("No events found."));
      }

      for (const event of events) {
        const userId = event.source.userId;
        const profile = await client.getProfile(userId);

        console.log("Processing event:", event);
        // console.log(profile)

        // type follow | member joined
        // if (event.type === 'follow' || event.type === 'memberJoined') {
        // }

        // type messasge

        message_trigger(event, userId, profile)

      }
      resolve();
    }
    catch (error) {
      console.error("Error in Webhook function:", error);
      reject(error);
    }
  });
}

const message_trigger = async function (event, userId, profile) {
  if (event.type === 'message') {
    let text = event.message.text;

    // if (text === 'คุณเป็นพนักงาน Nilecon') {
    //   await Register.Registration(event, client)
    // }

    if (text === 'My Points') {
      await Transfer.getBalanceByUserId(userId)
        .then((result) => {

          const Data = {
            balance: result.data.balance,
            profile: profile,
            client: client
          }

          Flex.pointCard(Data)

        }).catch((err) => {
          console.log(err)
        });
    }
  }
}



module.exports = LINE_SDK;
