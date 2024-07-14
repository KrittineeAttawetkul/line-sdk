"use strict";

const LineSDK = require('../model/linesdk');

exports.Webhook = async function(req, res)
{
    await LineSDK.Webhook(() => {
        res.status(200).end(); 
    }) 
    .catch(() => {
        res.status(500).end();
    })
}
