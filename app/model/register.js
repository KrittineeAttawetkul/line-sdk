'use strict';

const lineConfig = require('../../configs/lineConfig')
let response = {};
const richmenu = require('../../configs/richmenu');

const GenQr = require('./genQr');

var Register = function (user) {
    this.created_at = new Date();
};

Register.Registration = function (userId, client) {
    return new Promise(async resolve => {
        // const userId = event.source.userId;
        const profile = await client.getProfile(userId);
        // Reply กำลังดำเนินงาน
        // ----->
        // const replyToken = event.replyToken;
        const proMessage = [
            {
                type: 'text',
                text: 'ดำเนินการสำเร็จ'
            }
        ];

        await loading(userId);

        await GenQr.Register(profile)

        await client.pushMessage(userId, proMessage)
        await client.linkRichMenuToUser(userId, richmenu.main);
        resolve();
    })
}

function loading(userId) {
    return fetch("https://api.line.me/v2/bot/chat/loading/start", {
        method: "POST", // HTTP method
        headers: {
            "Content-Type": "application/json", // Content type
            Authorization: `Bearer ${lineConfig.channelAccessToken}` // Authorization header with Bearer token
        },
        body: JSON.stringify({ chatId: userId }) // Request payload
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error("Error:", error);
        });
}


module.exports = Register;