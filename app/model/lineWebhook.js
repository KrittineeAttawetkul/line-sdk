'use strict';

const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const richmenu = require('../../configs/richmenu');
const Register = require('./register');
const Canvas = require('./Canvas');
const Transfer = require('./transfer');

var LINE_SDK = function (user) {
  this.created_at = new Date();
};

LINE_SDK.Webhook = function (req) {
  return new Promise(async (resolve, reject) => {
    try {
      const events = req.body.events;
      //console.log('events: ', events)

      if (!events) {
        console.error("No events found in the request body.");
        return reject(new Error("No events found."));
      }

      for (const event of events) {
        const userId = event.source.userId;
        const profile = await client.getProfile(userId);

        //console.log("Processing event:", event);
        //console.log(profile)

        // type follow | member joined
        // if (event.type === 'follow' || event.type === 'memberJoined') {
        // }

        // type messasge

        message_trigger(event, userId)

      }
      resolve();
    }
    catch (error) {
      console.error("Error in Webhook function:", error);
      reject(error);
    }
  });
}

const message_trigger = async function (event, userId) {
  if (event.type === 'message') {
    let text = event.message.text;
    if (text === 'สมัครสมาชิก') {
      await Register.Registration(event, client)
    }
    if (text === 'Check point') {
      await Transfer.getBalanceByUserId(userId)
        .then((result) => {
          Canvas.pointBalance(event, client, result)
            .then((response) => {
              console.log(response)

              const pointCard = [
                {
                  "type": "image",
                  "originalContentUrl": "https://ba9b-1-20-91-118.ngrok-free.app/images/pointCard_U4ed202ba32ea29aa7a38b04ae2efabae.png",
                  "previewImageUrl": "https://ba9b-1-20-91-118.ngrok-free.app/images/pointCard_U4ed202ba32ea29aa7a38b04ae2efabae.png"
                }
              ];

              client.pushMessage(userId, pointCard)

            }).catch((err) => {
              console.log(err)
            });
        }).catch((err) => {
          console.log(err)
        });




    }
  }
}



module.exports = LINE_SDK;
