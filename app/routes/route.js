"use strict";

module.exports = function(app){
  var test = require("../controller/test");
  var lineSdk = require('../controller/linesdk');

  app.route("/api/test").get(test.Test)
  app.route("/webhook").post(lineSdk.Webhook)
}
