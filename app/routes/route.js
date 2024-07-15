"use strict";
const { middleware } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');

module.exports = function(app){
  var test = require("../controller/test");
  var lineSdk = require('../controller/linesdk');

  app.route("/api/test").get(test.Test);
  app.route("/webhook").post(lineSdk.Webhook);
}
