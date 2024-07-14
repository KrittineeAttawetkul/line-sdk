'use strict';

const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const richmenu = require('../../configs/richmenu');

var LINE_SDK = function(user) {
    this.created_at = new Date();
};

LINE_SDK.Webhook = function(req) {
    return new Promise(async (resolve, reject) => {
        try {
            const events = req.body.events;

            for (const event of events) {
                // Reply with the event JSON
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: `Event JSON: ${JSON.stringify(event, null, 2)}`
                });

                if (event.type === 'follow' || event.type === 'memberJoined') {
                    const userId = event.source.userId;
                    console.log('Follow | Member Joined (Event)');
                    console.log('UserId: ', userId);

                    // Check if the user is already a member
                    const profile = await client.getProfile(userId);
                    console.log('Profile Info: ', profile);
                    const isMember = checkIfMember(profile);

                    if (isMember) {
                        await client.linkRichMenuToUser(userId, richmenu.main);
                    } else {
                        await client.linkRichMenuToUser(userId, richmenu.login);
                    }
                }
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function checkIfMember(profile) {
  return true;
}

module.exports = LINE_SDK;
