"use strict";
const { middleware } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');

module.exports = function (app) {
  var test = require("../controller/test");
  var lineSdk = require('../controller/lineWebhook');
  var Users = require('../controller/users');
  const Transfer = require('../controller/transfer');


  app.route("/api/test").get(test.Test);
  app.route("/webhook").post(lineSdk.Webhook);
  // app.route("/api/users/:user_id").get(Users.getUserByUserId);
  app.route("/api/users").post(Users.getUserByUserId);
  app.route("/api/balance").post(Transfer.getBalanceByUserId);
  app.route("/api/transfer").post(Transfer.transferPoint);
  app.route("/api/earn").post(Transfer.earnPoint);
  app.route("/api/void").post(Transfer.voidPoint);
}
