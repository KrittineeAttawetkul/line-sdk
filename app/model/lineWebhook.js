'use strict';

const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const richmenu = require('../../configs/richmenu');
const Register = require('./register');

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

        // await loading(userId);

        //console.log("Processing event:", event);
        //console.log(profile)

        // type follow | member joined
        // if (event.type === 'follow' || event.type === 'memberJoined') {
        // }

        // type messasge
        message_trigger(event)

      }
      resolve();
    }
    catch (error) {
      console.error("Error in Webhook function:", error);
      reject(error);
    }
  });
}

LINE_SDK.getProfile = function (userId) {
  return new Promise(async (resolve, reject) => {

    try {
      const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${lineConfig.channelAccessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // The response is already parsed as an object
      //console.log('data Profile:', data);

      const user = {
        userId: data.userId,
        displayName: data.displayName,
        pictureUrl: data.pictureUrl
      }

      //console.log('User Profile:', user);

      resolve(user);

    } catch (error) {
      console.error('Error fetching user profile:', error);
      reject(error)
    }
  })
}

// function loading(userId) {
//   return fetch("https://api.line.me/v2/bot/chat/loading/start", {
//     method: "POST", // HTTP method
//     headers: {
//       "Content-Type": "application/json", // Content type
//       Authorization: `Bearer ${lineConfig.channelAccessToken}` // Authorization header with Bearer token
//     },
//     body: JSON.stringify({ chatId: userId }) // Request payload
//   })
//     .then(response => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .catch(error => {
//       console.error("Error:", error);
//     });
// }


const message_trigger = async function (event) {
  if (event.type === 'message') {
    let text = event.message.text;
    if (text === 'สมัครสมาชิก') {
      await Register.Registration(event, client)
    }
  }
}



module.exports = LINE_SDK;
