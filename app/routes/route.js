"use strict";
const lineConfig = require('../../configs/lineConfig');

module.exports = function (app) {
  var test = require("../controller/test");
  var lineSdk = require('../controller/lineWebhook');
  var Users = require('../controller/users');
  const Transfer = require('../controller/transfer');
  const History = require('../controller/history');
  const Reward = require('../controller/reward');

  app.route("/api/test").get(test.Test);
  app.route("/webhook").post(lineSdk.Webhook);
  // app.route("/api/users/:user_id").get(Users.getUserByUserId);
  app.route("/api/users").post(Users.getUserByUserId);
  app.route("/api/qr").post(Users.getQrByUserId);
  app.route("/api/register").post(Users.Register)


  app.route("/api/balance").post(Transfer.getBalanceByUserId);
  app.route("/api/member").post(Transfer.getCardByUserId);
  app.route("/api/transfer").post(Transfer.transferPoint);
  app.route("/api/earn").post(Transfer.earnPoint);
  app.route("/api/void").post(Transfer.voidPoint);
  app.route("/api/redeem").post(Transfer.Redeem);
  app.route("/api/earnredeem").post(Transfer.earnRedeem);
  app.route("/api/invoice").post(Transfer.getDataByInvoiceNum);
  app.route("/api/voidEarn").post(Transfer.voidEarn);
  app.route("/api/getprofile").post(Transfer.getProfile);


  app.route("/api/history").post(History.getHistoryByUserId);
  app.route("/api/ranking").post(History.balanceRanking);

  app.route("/api/addreward").post(Reward.addReward);
  app.route("/api/getreward").post(Reward.getRewardByReward_id);
  app.route("/api/updatereward").post(Reward.updateReward);
  app.route("/api/allReward").post(Reward.allReward);
  app.route("/api/rewardhistory").post(Reward.getRewardHistoryByUserId);

}



