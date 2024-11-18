"use strict";

module.exports = function (app) {
  var test = require("../controller/test");
  var lineSdk = require('../controller/lineWebhook');
  var Users = require('../controller/users');
  const Transfer = require('../controller/transfer');
  const History = require('../controller/history');
  const Reward = require('../controller/reward');
  const Auth = require('../controller/auth');

  app.route("/api/test").get(test.Test);
  app.route("/webhook").post(lineSdk.Webhook);

  //------------------USER------------------
  app.route("/api/users").post(Users.getUserByUserId);
  app.route("/api/qr").post(Users.getQrByUserId);
  app.route("/api/register").post(Users.Register)
  // app.route("/api/users/:user_id").get(Users.getUserByUserId);
  // app.route("/api/login").post(Users.Login)

  //------------------TRANSFER------------------
  app.route("/api/balance").post(Transfer.getBalanceByUserId);
  app.route("/api/member").post(Transfer.getCardByUserId);
  app.route("/api/transfer").post(Transfer.transferPoint);
  app.route("/api/redeem").post(Transfer.Redeem);
  app.route("/api/invoice").post(Transfer.getDataByInvoiceNum);
  app.route("/api/getprofile").post(Transfer.getProfile);

  //------------------HISTORY------------------
  app.route("/api/history").post(History.getHistoryByUserId);
  app.route("/api/ranking").post(History.balanceRanking);

  //------------------REWARD------------------
  app.route("/api/getreward").post(Reward.getRewardByReward_id);
  app.route("/api/allReward").post(Reward.allReward);
  app.route("/api/rewardhistory").post(Reward.getRewardHistoryByUserId);

  
  //-----------------------CMS-----------------------
  app.route('/api/login').post(Auth.Login);

  //------------------Transfer:CMS------------------
  app.route("/api/earn").post(Transfer.earnPoint);
  app.route("/api/void").post(Transfer.voidPoint);
  app.route("/api/earnredeem").post(Transfer.earnRedeem);
  app.route("/api/voidEarn").post(Transfer.voidEarn);

  //------------------REWARD:CMS------------------
  app.route('/api/rewardlist').post(Auth.rewardList);
  // app.route('/api/rewardlist').post(Auth.verifyToken, Auth.rewardList);
  app.route("/api/updatereward").post(Auth.verifyToken, Reward.updateReward);
  app.route("/api/addreward").post(Auth.verifyToken, Reward.addReward);






}



