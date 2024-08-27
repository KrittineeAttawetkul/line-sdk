'use strict';

const lineConfig = require('../../configs/lineConfig')
let response = {};
const richmenu = require('../../configs/richmenu');

const GenQr = require('./genQr');

var Register = function (user) {
    this.created_at = new Date();
};

Register.Registration = function (input, client) {
    return new Promise(async (resolve, reject) => {
        // const userId = event.source.userId;
        const profile = await client.getProfile(input.user_id);
        // Reply กำลังดำเนินงาน
        // ----->
        // const replyToken = event.replyToken;
        const tel = {
            tel: input.tel
        }
        Object.assign(profile, tel)

        const proMessage = [
            {
                type: 'text',
                text: 'ยินดีตอนรับเข้าสู่ระบบ'
            }
        ];

        await GenQr.Register(profile)
            .then(async (result) => {
                // console.log('GenQr')
                if (result.status) {
                    // console.log('result True', result)
                    await loading(input.user_id);
                    await client.pushMessage(input.user_id, proMessage)
                    await client.linkRichMenuToUser(input.user_id, richmenu.main);
                    resolve(result)
                } else {
                    // console.log('result False', result)
                    resolve(result)
                }
            }).catch((err) => {
                console.log(err)
            });
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