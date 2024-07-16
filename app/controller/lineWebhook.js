"use strict";

const LineSDK = require('../model/lineWebhook.js');

exports.Webhook = async function(req, res) {
    try {
        await LineSDK.Webhook(req);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(500);
    }
}
