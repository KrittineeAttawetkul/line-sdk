'use strict';
let response = {};
const richmenu = require('../../configs/richmenu');

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
        const messages = [
            {
                type: 'text',
                text: 'กำลังดำเนินการ'
            }
        ];

        client.replyMessage(replyToken, messages)
        console.log(profile)
        
        //<----------- API DATA BASE สร้าง model ใหม่

        client.linkRichMenuToUser(userId, richmenu.main);
    })
}


module.exports = Register;