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

        client.linkRichMenuToUser(userId, richmenu.main);
    })
}


module.exports = Register;