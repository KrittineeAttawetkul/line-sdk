"use strict";

const LineSDK = require('../model/linesdk');

exports.Webhook = async function(req, res) {
    try {
        await LineSDK.Webhook(req);
        res.status(200).send();
    } catch (error) {
        res.status(500).send();
    }
}
