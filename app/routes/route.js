"use strict";
const { middleware } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');

module.exports = function(app){
  var test = require("../controller/test");
  var lineSdk = require('../controller/lineWebhook');
  var Users = require('../controller/users');


  app.route("/api/test").get(test.Test);
  app.route("/webhook").post(lineSdk.Webhook);
  // app.route("/api/users/:user_id").get(Users.getUserByUserId);
  app.route("/api/users").post(Users.getUserByUserId);
}
