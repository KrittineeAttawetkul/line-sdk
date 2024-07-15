'use strict';

const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const richmenu = require('../../configs/richmenu');

var LINE_SDK = function (user) {
  this.created_at = new Date();
};

LINE_SDK.Webhook = function (req) {
  return new Promise(async (resolve, reject) => {
    try {
      const events = req.body.events;
      console.log('events: ', events)

      if (!events) {
        console.error("No events found in the request body.");
        return reject(new Error("No events found."));
      }

      for (const event of events) {
        const userId = event.source.userId;
        const profile = await client.getProfile(userId);
        console.log("Processing event:", event);

        // type follow | member joined
        // if (event.type === 'follow' || event.type === 'memberJoined') {
        // }

        // type messasge
        if (event.type === 'message') {
          let text = event.message.text; 
          if(text === 'กำลังสมัครสมาชิก...')
          {
            client.linkRichMenuToUser(userId, richmenu.main);
          }
        }
      }
      resolve();
    } 
    catch (error) {
      console.error("Error in Webhook function:", error);
      reject(error);
    }
  });
}

module.exports = LINE_SDK;
