'use strict';
let response = {};
const richmenu = require('../../configs/richmenu');

const GenQr = require('./genQr');

var Register = function (user) {
    this.created_at = new Date();
};

Register.Registration = function (event, client) {
    return new Promise(async resolve => {
        const userId = event.source.userId;
        const profile = await client.getProfile(userId);
        // Reply กำลังดำเนินงาน
        // ----->
        const replyToken = event.replyToken;
        const preMessage = [
            {
                type: 'text',
                text: 'กำลังดำเนินการ'
            }
        ];
        const proMessage = [
            {
                type: 'text',
                text: 'ดำเนินการสำเร็จ'
            }
        ];

        let preMessageRes = await client.replyMessage(replyToken, preMessage)
        console.log("preMessageRes: ", preMessageRes);

        //<----------- API DATA BASE สร้าง model ใหม่

        await GenQr.Register(profile)

        // //console.log("replyToken: ", replyToken)
        client.pushMessage(userId,proMessage)
        client.linkRichMenuToUser(userId, richmenu.main);
    })
}


module.exports = Register;